/**
 * Created by admin on 2017/7/28.
 */
return;
let assert = require("chai").assert;
let promiseDescribe = require("../src/util").promiseDescribe;

let Model = require("../index");
// 换了一组测试数据
let config = require("../config/shop.json");

Model.init(config);

describe.skip("Aggregate", function(){
    let products = new Model("products");
    promiseDescribe("#count", function (globalVal, done) {
        products.where("prod_price", ">", "10").count().then(res=>{
            globalVal.total = res;
            done();
        });
    }, function (globalVal) {
        it("#count should retrn total num", function(){
            assert.isNumber(globalVal.total);
        });
    });

    promiseDescribe("#max", function (globalVal, done) {
        products.max("prod_price").then(res=>{
            globalVal.max = res;
            done();
        });
    }, function (globalVal) {
        it("#count should retrn the max prod_price", function(){
            assert.isNumber(globalVal.max);
            assert.equal(globalVal.max, 55.00);
        });
    });

    promiseDescribe("#min", function (globalVal, done) {
        products.min("prod_price").then(res=>{
            globalVal.min = res;
            done();
        });
    }, function (globalVal) {
        it("#count should retrn the min prod_price", function(){
            assert.isNumber(globalVal.min);
            assert.equal(globalVal.min, 2.5);
        });
    });

    promiseDescribe("#avg", function (globalVal, done) {
        products.avg("prod_price").then(res=>{
            globalVal.avg = res;
            done();
        });
    }, function (globalVal) {
        it("#count should retrn the avgerage prod_price", function(){
            assert.isNumber(globalVal.avg);
        });
    });

    promiseDescribe("#sum", function (globalVal, done) {
        products.sum("prod_price").then(res=>{
            globalVal.sum = res;
            done();
        });
    }, function (globalVal) {
        it("#count should retrn total prod_price", function(){
            assert.isNumber(globalVal.sum);
        });
    });

    promiseDescribe("#increment", function (globalVal, done) {
        products.where("prod_id", "FB").increment("prod_price", 1).then(res=>{
            console.log(products.sql);
            globalVal.row = res;
            done();
        });
    }, function (globalVal) {
        it("#count should increment", function(){
            assert.isNumber(globalVal.row);
        });
    });

});
