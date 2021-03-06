/**
 * Created by admin on 2017/7/29.
 */
let is = require("is");
let SqlString = require("sqlstring");
let util = require("./util");

let DB = require("./DB");

let {formateCondition} = util;

let Model = function (tablename) {

    if (is.empty(Model.pool)) {
        throw new Error("use Model.init(config) before create a model instance");
    }

    this.pool = Model.pool;
    this.name = tablename;

    this.latestSql = "";
    this.reset();
};

// copy the shortcut methods from DB
Object.assign(Model, DB);

//============base============//
Object.assign(Model.prototype, {
    query(sql, values){
        return Model.query(sql, values).catch(err=>{
            console.log(sql);
        });
    },
    raw(){
        // todo 返回不转义的原生语句
    },
    escape(val){
        return SqlString.escape(val);
    },
    escapeId(key){
        return SqlString.escapeId(key);
    }

});


Object.assign(Model.prototype, {
    reset(){
        this._where = "";
        this._tableName = this.name;

        this._selectClause = {
            distinct: "",
            join: "",
            group: "",
            having: "",
            order: "",
            limit: "",
            offset: "",

            // todo
            union: "",
        };
    },

    select(fields){
        let sql = "SELECT %distinct% %field% FROM %table% %join% %where% %group% %having% %order% %limit% %offset% %UNION%";

        let caluse = this._selectClause;
        caluse.where = this._where;
        caluse.table = this._tableName;

        // use 'AS' in field
        if (is.array(fields)) {
            // ["id", "name", "password AS pwd"]
            caluse.field = fields.join(", ");
        }else if(is.string(fields)){
            // ["id, name, password AS pwd"]
            caluse.field = fields;
        }else {
            caluse.field = "*";
        }

        sql = sql.replace(/%(\w+?)%/g, (str, key) => {
            key = key.toLowerCase();
            let val = caluse[key];
            return val || "";
        });


        this.sql = sql;
        this.reset();

        return this.query(sql);
    },
    insert(values){
        let sql = `INSERT INTO ${this._tableName} SET ?`;
        sql = SqlString.format(sql, values);

        this.sql = sql;

        return this.query(sql).then(res => {
            return res.insertId;
        });
    },
    update(data){
        if (is.empty(this._where)) {
            throw new Error("WHERE statements must be used in UPDATE operation");
        }

        // todo 默认的转义无法使用计算字段
        let fileds = [];
        for (let key in data){
            if (data.hasOwnProperty(key)){
                fileds.push(`${this.escapeId(key)} = ${this.escape(data[key])}`);
            }
        }

        let sql = `UPDATE ${this._tableName} SET ${fileds.join(", ")} ${this._where}`;
        this.sql = sql;
        return this.query(sql).then(res => {
            return res.changedRows;
        });
    },
    delete(){
        if (is.empty(this._where)) {
            throw new Error("WHERE statements must be used in DELETE operation");
        }

        let sql = `DELETE FROM ${this._tableName} ${this._where}`;
        this.sql = sql;

        return this.query(sql).then(res => {
            return res.affectedRows;
        });
    },
});

//============select============//
Object.assign(Model.prototype, {

    // DISTINCT
    distinct(){
        this._selectClause.distinct = "DISTINCT";
        return this;
    },

    // JOIN
    alias(name){
        if (~(this._tableName).indexOf(",")) {
            throw new Error("alias() just for the model table name, use before join()");
        }

        this._tableName = this._tableName + " AS " + name;
        return this;
    },
    _join(table, key, logic, value, type = "INNER"){
        this._selectClause.join += `${type} JOIN ${table} ON ${formateCondition(key, logic, value)}`;
    },
    join(table, key, logic, value){
        this._join(table, key, logic, value);
        return this;
    },
    leftJoin(table, key, logic, value){
        this._join(table, key, logic, value, "LEFT");
        return this;
    },
    rightJoin(table, key, logic, value){
        this._join(table, key, logic, value, "RIGHT");
        return this;
    },

    // WHERE
    where(key, logic, value){
        if (!is.empty(this._where)) {
            throw new Error("WHERE clause is not clean, please use orWhere or andWhere instead");
        }

        this._where = " WHERE " + formateCondition(key, logic, value);

        return this;
    },
    orWhere(key, logic, value){
        if (is.empty(this._where)) {
            throw new Error("you should use where() before orWhere");
        }

        this._where += " OR " + formateCondition(key, logic, value);
        return this;
    },
    andWhere(key, logic, value){
        if (is.empty(this._where)) {
            throw new Error("you should use where() before orWhere");
        }
        this._where += " AND " + formateCondition(key, logic, value);
        return this;
    },

    // GROUP
    groupBy(field){
        if (is.empty(field)) {
            throw new Error("groupBy() need at least one column");
        }

        this._selectClause.group = " GROUP BY " + this.escapeId(field);
        return this;
    },
    having(key, logic, value){
        if (is.empty(this._selectClause.group)) {
            throw new Error("HAVING must use after GROUP BY clause");
        }

        this._selectClause.having = " HAVING " + formateCondition(key, logic, value);
        return this;
    },

    // ORDER
    orderBy(field, logic = "DESC"){

        if (is.empty(this._selectClause.order)) {
            this._selectClause.order = " ORDER BY " + this.escapeId(field) + " " + logic;
        } else {
            this._selectClause.order += ", " + this.escapeId(field) + " " + logic;
        }
        return this;
    },

    // LIMIT
    limit(size){
        size = parseInt(size, 10);
        if (isNaN(size)){
            throw new Error("LIMIT size is not a number");
        }
        this._selectClause.limit = " LIMIT " + this.escape(size);
        return this;
    },
    offset(size){
        if (is.empty(this._selectClause.limit)) {
            throw new Error("OFFSET must use after LIMIT clause");
        }

        size = parseInt(size, 10);
        if (isNaN(size)){
            throw new Error("OFFSET size is not a number");
        }

        this._selectClause.offset = " OFFSET " + this.escape(size);
        return this;
    },
});

//============aggregate============//
Object.assign(Model.prototype, {
    // 聚合函数
    count(){
        return this.select("COUNT(*) AS total").then(res=>{
            return res[0] && res[0].total;
        });
    },
    max(field){
        return this.select(`MAX(${field}) AS max`).then(res=>{
            return res[0] && res[0].max;
        });
    },
    min(field){
        return this.select(`MIN(${field}) AS min`).then(res=>{
            return res[0] && res[0].min;
        });
    },
    avg(field){
        return this.select(`AVG(${field}) AS avg`).then(res=>{
            return res[0] && res[0].avg;
        });
    },
    sum(field){
        return this.select(`SUM(${field}) AS sum`).then(res=>{
            return res[0] && res[0].sum;
        });
    },
    // todo : 转换成无引号的sql语句
    // increment(field, step = 1){
    //     let values = {};
    //     values[field] = `${field} + ${step}`;
    //     return this.update(values);
    // }
});

module.exports = Model;