/**
 * Created by admin on 2017/7/29.
 */
let assert = require("chai").assert;
let Model = require("../src/Model");

let promiseDescribe = require("../src/util").promiseDescribe;

let logger = require("../src/logger");

describe("Model", function () {
    let admin = new Model("shymean_admin");

    context("#where", function () {

        promiseDescribe("=", function (globalVal, done) {
            admin.where("id", 1).select().get().then((res) => {
                globalVal.name = res[0].name;
                done();
            });
        }, function (globalVal) {
            it("'id = 1' should return root account", function () {
                assert.equal("root", globalVal.name);
            });
        });

        promiseDescribe("<", function (globalVal, done) {
            admin.where("id", "<", 5).select().get().then((res) => {
                globalVal.name = res[0].name;
                done();
            });
        }, function (globalVal) {
            it("'id < 5'should return root account", function () {
                assert.equal("root", globalVal.name);
            });
        });

        promiseDescribe("orWhere", function (globalVal, done) {
            admin.where("id", 1).orWhere("id", 10).select().get().then((res) => {
                globalVal.length = res.length;
                done();
            });
        }, function (globalVal) {
            it("id = 10 or id = 1 should return 2 rows", function () {
                assert.equal(2, globalVal.length);
            });
        });

        promiseDescribe("andWhere", function (globalVal, done) {
            admin.where("id", 1).andWhere("name", "root").select().get().then((res) => {
                globalVal.length = res.length;
                done();
            });
        }, function (globalVal) {
            it("id = 1 and name = 'root' should return 1 row", function () {
                assert.equal(1, globalVal.length);
            });
        });
    });

    context("#select", function () {
        promiseDescribe("default '*'", function (globalVal, done) {
            admin.select().get().then((res) => {
                globalVal.length = Object.keys(res[0]).length;
                done();
            });
        }, function (globalVal) {
            it("default '*' should return 7 cloumns", function () {
                assert.equal(7, globalVal.length);
            });
        });

        promiseDescribe("indicate columns", function (globalVal, done) {
            admin.select(["id", "name", "password"]).get().then((res) => {
                globalVal.length = Object.keys(res[0]).length;
                done();
            });
        }, function (globalVal) {
            it("indicate 3 columns should return 3 cloumns", function () {
                assert.equal(3, globalVal.length);
            });
        });

    });

    promiseDescribe("#distinct", function (globalVal, done) {
        admin.distinct().where("name", "distinct_name").select(["name"]).get().then((res) => {
            globalVal.length = res.length;
            done();
        });
    }, function (globalVal) {
        it("should return 1 row", function () {
            assert.equal(1, globalVal.length);
        });
    });

    context("#join", function () {
        let article = new Model("shymean_article");

        promiseDescribe("base", function (globalVal, done) {
            article.alias("a").join("shymean_article_tag AS t", "a.id", "t.article_id").select(["a.title", "t.tag_id"]).get().then((res) => {
                globalVal.length = res.length;
                done();
            });
        }, function (globalVal) {
            it("should return 3 tag_id", function () {
                assert.equal(3, globalVal.length);
            });
        });
    });

    context("#order", function () {
        promiseDescribe("desc", function (globalVal, done) {
            admin.orderBy("id").select(["id", "name"]).get().then(res => {
                globalVal.isDesc = res[0].id > res[1].id;
                done();
            });
        }, function (globalVal) {
            it("the first id is bigger than second", function () {
                assert.equal(true, globalVal.isDesc);
            });
        });

        promiseDescribe("asc", function (globalVal, done) {
            admin.orderBy("id", "ASC").select(["id", "name"]).get().then(res => {
                globalVal.isAsc = res[0].id < res[1].id;
                done();
            });
        }, function (globalVal) {
            it("the first id is smaller than second", function () {
                assert.equal(true, globalVal.isAsc);
            });
        });
    });

    promiseDescribe("limit", function (globalVal, done) {
        admin.limit(2).select(["id", "name"]).get().then(res => {
            globalVal.length = res.length;
            done();
        });
    }, function (globalVal) {
        it.only("should return 2 rows", function () {
            assert.equal(2, globalVal.length);
        });
    });

    promiseDescribe("offset", function (globalVal, done) {
        admin.limit(1).offset(1).select(["id", "name"]).get().then(res => {
            globalVal.name = res[0].name;
            done();
        });
    }, function (globalVal) {
        it.only("should return the second row", function () {
            assert.equal("txm", globalVal.name);
        });
    });
});

