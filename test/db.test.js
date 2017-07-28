/**
 * Created by admin on 2017/7/29.
 */
let assert = require("assert");
let DB = require("../src/DB");

describe("DB", function(){
    describe("#get", function(){
        let length = 0;

        beforeEach(function (done) {
            DB.get().then(result=>{
                length = result.length;
                done();
            });
        });

        it("查询admin表应返回2条数据", function(){
            assert.equal(2, length);
        });
    });
});