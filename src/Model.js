/**
 * Created by admin on 2017/7/29.
 */
let pool = require("./pool");

let Model = function (tablename) {
    this._tableName = tablename;
    this.pool = pool;
};

Object.assign(Model.prototype, {
    // where这里可以拓展快捷方法
    where(key, value, logic = "="){},
    orWhere(key, value, logic = "="){},
    andWhere(key, value, logic = "="){},


    // 聚合函数
    count(){},
    max(field){},
    min(field){},
    avg(field){},
    sum(){},

    // 联结
    join(table, field1, field2, logic){},

    orderBy(filed, logic="desc"){},
    groupBy(){}
});

module.exports = Model;