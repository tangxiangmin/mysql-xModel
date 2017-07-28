/**
 * Created by admin on 2017/7/27.
 */

let pool = require("./pool");
let Model = require("./Model");
// let transition = require("./transaction");

let util = require("./util");
let logger =  require("./logger");

let { promiseify } = util;

let DB = {
    pool,
    // sql: "SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %UNION%%COMMENT%",
    sql: "SELECT * from shymean_admin",
    // 获取所有结果
    get(){
        let sql = this.sql;
        let pool = this.pool;
        return promiseify(pool.query, pool)(sql);
    },
    // 基本方法
    selelct(sql, values){},
    insert(sql, values){},
    update(sql, values){},
    remove(sql, values){},

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
