/**
 * Created by admin on 2017/7/28.
 */
let assert = require("assert");

let Model = require("../index");

describe("Pool", function(){
    it("pool should be single instance", function(){
        let m_1 = new Model("shymean_test");
        let m_2 = new Model("shymean_test");
        assert.equal(m_1.pool, m_2.pool);
    });
});
