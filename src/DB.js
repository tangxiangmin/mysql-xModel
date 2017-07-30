/**
 * Created by admin on 2017/7/27.
 */
let is = require("is");

let pool = require("./pool");
let Model = require("./Model");
// let transition = require("./transaction");

let util = require("./util");
let logger =  require("./logger");

let { promiseify } = util;

let DB = {
    pool,
    //
    sql: "SELECT * from shymean_admin",
    query(sql, values){
        let pool = this.pool;

        return promiseify(pool.query, pool)(sql, values);
    },

    // 获取所有结果
    get(){
        return this.query(this.sql);
    },
    find(){

    },
    //======基本方法=======//
    selelct(sql, values){
        return this.query(sql, values);
    },

    insert(sql, values){
        return this.query(sql, values).then(res=>{
            return res.insertId;
        });
    },
    /**
     *
     * @param sql
     * @param [update values, where]
     * @returns {Promise.<TResult>}
     */
    update(sql, values){

        if (is.empty(values[1])){
            throw new Error("WHERE statements must be used in UPDATE operation");
        }

        return this.query(sql, values).then(res=>{
            return res.changedRows;
        });
    },

    delete(sql, where){
        if (is.empty(where)){
            throw new Error("WHERE statements must be used in DELETE operation");
        }

        return this.query(sql, where).then(res=>{
            return res.affectedRows;
        });
    },

    //======查询构建器=======//
    // 关联对应的表
    table(tablename){
        return new Model(tablename);
    },

    // 把某个表达式以字符串形式注入到sql语句中
    raw(sql){
        return sql;
    },
};

module.exports = DB;
