/**
 * Created by admin on 2017/7/29.
 */
let is = require("is");
let logger =  require("./logger");
let SqlString = require("sqlstring");

let pool = require("./pool");

let util = require("./util");
let { promiseify } = util;

let Model = function (tablename) {
    this.pool = pool;
    this.name = tablename;

    this.latestSql = "";
    this.reset();
};

function formateCondition(key, logic, value) {
    if(typeof value === "undefined"){
        value = logic;
        logic = " = ";
    }

    // inner join
    // eg: a.id = b.userId
    if (!~(value+"").indexOf(".")){
        value = SqlString.escape(value);
    }

    return key + logic + value ;
}

//============base============//

Object.assign(Model.prototype, {
    reset(){
        this.sql = "";

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
    get(){
        let { sql, pool } = this;

        if (is.empty(sql)){
            throw new Error("must set sql before get()");
        }

        this.latestSql = sql;
        this.reset();

        return promiseify(pool.query, pool)(sql);
    },
});

//============select============//
Object.assign(Model.prototype, {

    select(fields){
        let sql = "SELECT %distinct% %field% FROM %table% %join% %where% %group% %having% %order% %limit% %offset% %UNION%";

        let caluse = this._selectClause;
        caluse.where = this._where;
        caluse.table = this._tableName;
        caluse.field = fields ? SqlString.escapeId(fields) : "*";

        sql = sql.replace(/%(\w+?)%/g,  (str, key)=>{
            key = key.toLowerCase();
            let val = caluse[key];
            return val || "";
        });

        this.sql = sql;

        return this;
    },

    // DISTINCT
    distinct(){
        this._selectClause.distinct = "DISTINCT";
        return this;
    },

    // JOIN
    alias(name){
        if (~(this._tableName).indexOf(",")){
            throw new Error("alias() just for the model table name, use before join()");
        }

        this._tableName = this._tableName + " AS " + name;
        return this;
    },
    join(table, key, logic, value){
        this._selectClause.join += ", " + table;

        if(is.empty(this._where)){
            this.where(key, logic, value);
        }else  {
            this.andWhere(key, logic, value);
        }

        return this;
    },

    // WHERE
    where(key, logic, value){
        if(!is.empty(this._where)){
            throw new Error("WHERE clause is not clean, please use orWhere or andWhere instead");
        }

        this._where = " WHERE " + formateCondition(key, logic, value);

        return this;
    },
    orWhere(key, logic, value){
        if(is.empty(this._where)){
            throw new Error("you should use where() before orWhere");
        }

        this._where += " OR " + formateCondition(key, logic, value);
        return this;
    },
    andWhere(key, logic, value){
        if(is.empty(this._where)){
            throw new Error("you should use where() before orWhere");
        }
        this._where += " AND " + formateCondition(key, logic, value);
        return this;
    },

    // GROUP
    groupBy(field){
        if(is.empty(field)){
            throw new Error("groupBy() need at least one column");
        }

        this._selectClause.group = " GROUP BY " + SqlString.escapeId(field);
        return this;
    },
    having(key, logic, value){
        if(is.empty(this._selectClause.group)){
            throw new Error("HAVING must use after GROUP BY clause");
        }

        this._selectClause.having = " HAVING " + formateCondition(key, logic, value);
        return this;
    },

    // ORDER
    orderBy(field, logic = "DESC"){

        if(is.empty(this._selectClause.order)) {
            this._selectClause.order = " ORDER BY " + SqlString.escapeId(field) + " " + logic;
        }else {
            this._selectClause.order += ", " + SqlString.escapeId(field) + " " + logic;
        }
        return this;
    },

    // LIMIT
    limit(size){
        this._selectClause.limit = " LIMIT " + SqlString.escape(size);
        return this;
    },
    offset(size){
        if(is.empty(this._selectClause.limit)) {
            throw new Error("OFFSET must use after LIMIT clause");
        }
        this._selectClause.offset = " OFFSET " + SqlString.escape(size);
        return this;
    },
});

//============aggregate============//
Object.assign(Model.prototype, {
    // 聚合函数
    count(){},
    max(field){},
    min(field){},
    avg(field){},
    sum(){},
});

module.exports = Model;