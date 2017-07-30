/**
 * Created by admin on 2017/7/29.
 */

let mysql = require("mysql");

let getPool = (function () {
    let pool = null;
    return function (opts) {
        if (!pool){
            pool = mysql.createPool(opts);
        }
        return pool;
    };
})();

module.exports = getPool;