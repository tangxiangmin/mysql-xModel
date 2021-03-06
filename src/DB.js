/**
 * Created by admin on 2017/7/27.
 */
let is = require("is");
let getPool = require("./pool");
let util = require("./util");

let { promiseify } = util;

let DB = {
    init(config){
        this.pool = getPool(config);
    },
    query(sql, values){
        let pool = this.pool;
        if (is.empty(pool)){
            throw new Error("use Model.init(config) first");
        }
        return promiseify(pool.query, pool)(sql, values);
    },

    // todo 把某个表达式以字符串形式注入到sql语句中
    raw(sql){
        return sql;
    },
};

module.exports = DB;
