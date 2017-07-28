/**
 * Created by admin on 2017/7/28.
 */
let assert = require("assert");

let DB = require("../src/DB");
let Model = require("../src/Model");

describe("Dev", function(){
    describe("#pool", function(){
        it("pool应为单例对象", function(){
            let m = new Model("shymean_test");
            assert.equal(m.pool, DB.pool);
        });
    });
});