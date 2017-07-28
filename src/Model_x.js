/**
 * 封装node-mysql基础模型
 * 实现链式调用和常用的数据处理接口
 */

let mysql = require("mysql");
let SqlString = require("sqlstring");

let config = require("./../config/db.json");


class Model {
    constructor(tableName = ""){
        this.config = config;
        this._tableName = tableName;
        this.reset();
        this.connect();
    }

    reset(){
        this._distinct = "";
        this._field = "*";
        this._where = "1";
        this._group = "";
        this._order = "";
        this._limit = "";
        this._tableName = this._originTableName;
    }

    // 连接和关闭
    connect(){
        this.conn = mysql.createConnection(this.config);
        this.conn.connect();
    }

    close(){
        this.conn.end();
    }

    // 拼接查询字段
    getSelectSql(){
        return `SELECT ${this._distinct} ${this._field} FROM ${this._tableName} WHERE ${this._where} ${this._group} ${this._order} ${this._limit}`;
    }

    query(sql){
        return new Promise((resolve, reject)=>{
            this.conn.query(sql, (err, rows)=>{
                if (err) {
                    reject(sql);
                    // throw err;
                }
                resolve(rows);
                this.reset();
                this.latestSql = sql;
                // 这里断开连接的话下次查询就会失败，待解决
                // this.close();
            });
        })
    }

    getLatestSql(){
        return this.latestSql;
    }

    // 链式操作
    where(params, logic = "AND"){
        logic = ' ' + logic;
        if (params){
            let count = 0;
            this._where = "";
            for(let key in params){
                if (params.hasOwnProperty(key)){
                    if (count++ > 0){
                        this._where += logic;
                    }

                    let val = params[key];

                    if (~(val+"").indexOf(".")){
                        this._where += `${key} = ${val}`;
                    }else {
                        this._where += `${key} = '${val}'`;
                    }
                }
            }

        }else {
            this._where = "1";
        }

        return this;
    }

    field(fields = ""){
        this._field = fields ? fields : "*";
        return this;
    }

    distinct(){
        this._distinct = "DISTINCT";
        return this;
    }

    order(fields = "", logic = "DESC"){
        this._order = fields ? `ORDER BY ${SqlString.escapeId(fields)} ${logic}` : "";
        return this;
    }

    limit(num = 1, offset = 1){
        this._limit = `LIMIT ${num} OFFSET ${offset}`;
        return this;
    }

    group(fields = "") {
        this._group = fields ? `GROUP BY ${SqlString.escapeId(fields)}` : "";
        return this;
    }

    // CURD
    select(){
        let sql = this.getSelectSql();
        return this.query(sql);
    }
    find(){
        return this.select().then((data)=>{
            return data[0];
        })
    }
    // join
    alias(name){
        this._tableName += ` AS ${name}`;
        return this;
    }
    join(tables){

        tables.forEach(item=>{
            this._tableName += `, ${item}`
        });

        return this;
    }
    // 按照指定字段对结果进行分组
    groupBy(field){
        return this.select().then((data)=>{
            let map = {};
            data.forEach((item)=>{
                let fieldVal = item[field];
                if (typeof map[fieldVal] === "undefined") {
                    map[fieldVal] = [item];
                }else {
                    map[fieldVal].push(item);
                }
            });

            return map;
        });
    }

    add(params){
        let sql = SqlString.format(`INSERT INTO ${this._tableName} SET ?`, params);
        return this.query(sql);
    }

    update(primarykey, params){
        let sql = SqlString.format(`UPDATE ${this._tableName} SET ? WHERE ${this._primarykey} = '${primarykey}'`, params);

        return this.query(sql).then((data)=>{
            let { affectedRows } = data;
            return { affectedRows };
        },(err)=>{
            console.log(err);
        });
    }

    remove(){
        let sql = SqlString.format(`DELETE FROM ${this._tableName} WHERE ${this._where}`);
        return this.query(sql).then((data)=>{
            let { affectedRows } = data;
            return { affectedRows };
        }, (err)=>{
            console.log(err);
        });
    }
}

module.exports = Model;

