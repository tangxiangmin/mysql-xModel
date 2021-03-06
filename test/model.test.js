/**
 * Created by admin on 2017/7/29.
 */
let assert = require("chai").assert;
let promiseDescribe = require("../src/util").promiseDescribe;

let Model = require("../index");
let config = require("../config/db.json");

Model.init(config);

let admin = new Model("shymean_admin");

describe.only("Model", function () {
    context("#where", function () {
        promiseDescribe("=", function (globalVal, done) {
            admin.where("id", 1).select().then((res) => {
                globalVal.name = res[0].name;
                done();
            });
        }, function (globalVal) {
            it("'id = 1' should return root account", function () {
                assert.equal("root", globalVal.name);
            });
        });

        promiseDescribe("<", function (globalVal, done) {
            admin.where("id", "<", 5).select().then((res) => {
                globalVal.name = res[0].name;
                done();
            });
        }, function (globalVal) {
            it("'id < 5'should return root account", function () {
                assert.equal("root", globalVal.name);
            });
        });

        promiseDescribe("orWhere", function (globalVal, done) {
            admin.where("id", 1).orWhere("id", 10).select().then((res) => {
                globalVal.length = res.length;
                done();
            });
        }, function (globalVal) {
            it("id = 10 or id = 1 should return 2 rows", function () {
                assert.equal(2, globalVal.length);
            });
        });

        promiseDescribe("andWhere", function (globalVal, done) {
            admin.where("id", 1).andWhere("name", "root").select().then((res) => {
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
            admin.select().then((res) => {
                globalVal.length = Object.keys(res[0]).length;
                done();
            });
        }, function (globalVal) {
            it("default '*' should return 7 cloumns", function () {
                assert.equal(7, globalVal.length);
            });
        });

        promiseDescribe("indicate columns", function (globalVal, done) {
            admin.select(["id", "name", "password"]).then((res) => {
                globalVal.length = Object.keys(res[0]).length;
                done();
            });
        }, function (globalVal) {
            it("indicate 3 columns should return 3 cloumns", function () {
                assert.equal(3, globalVal.length);
            });
        });

        promiseDescribe("#distinct", function (globalVal, done) {
            admin.distinct().where("name", "distinct_name").select(["name"]).then((res) => {
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

            promiseDescribe("inner join", function (globalVal, done) {
                article.alias("a").join("shymean_article_tag AS t", "a.id", "t.article_id").select(["a.title", "t.tag_id"]).then((res) => {
                    globalVal.length = res.length;
                    done();
                });
            }, function (globalVal) {
                it("should return rows", function () {
                    assert.isNumber(globalVal.length);
                });
            });
            promiseDescribe("left join", function (globalVal, done) {
                article.alias("a").leftJoin("shymean_article_tag AS t", "a.id", "t.article_id").select(["a.title", "t.tag_id"]).then((res) => {
                    globalVal.length = res.length;
                    done();
                });
            }, function (globalVal) {
                it("should return rows", function () {
                    assert.isNumber(globalVal.length);
                });
            });
            promiseDescribe("right join", function (globalVal, done) {
                article.alias("a").rightJoin("shymean_article_tag AS t", "a.id", "t.article_id").select(["a.title", "t.tag_id"]).then((res) => {
                    globalVal.length = res.length;
                    done();
                });
            }, function (globalVal) {
                it("should return rows", function () {
                    assert.isNumber(globalVal.length);
                });
            });
        });

        context("#order", function () {
            promiseDescribe("desc", function (globalVal, done) {
                admin.orderBy("id").select(["id", "name"]).then(res => {
                    globalVal.isDesc = res[0].id > res[1].id;
                    done();
                });
            }, function (globalVal) {
                it("the first id is bigger than second", function () {
                    assert.equal(true, globalVal.isDesc);
                });
            });

            promiseDescribe("asc", function (globalVal, done) {
                admin.orderBy("id", "ASC").select(["id", "name"]).then(res => {
                    globalVal.isAsc = res[0].id < res[1].id;
                    done();
                });
            }, function (globalVal) {
                it("the first id is smaller than second", function () {
                    assert.equal(true, globalVal.isAsc);
                });
            });
        });
        context("#limit", function () {

            promiseDescribe("base", function (globalVal, done) {
                admin.limit(2).select(["id", "name"]).then(res => {
                    globalVal.length = res.length;
                    done();
                });
            }, function (globalVal) {
                it("should return 2 rows", function () {
                    assert.equal(2, globalVal.length);
                });
            });
            promiseDescribe("size is a number-string", function (globalVal, done) {
                admin.limit("2").select(["id", "name"]).then(res => {
                    globalVal.length = res.length;
                    done();
                });
            }, function (globalVal) {
                it("should parse size to a number", function () {
                    assert.equal(2, globalVal.length);
                });
            });

            promiseDescribe("offset", function (globalVal, done) {
                admin.limit(1).offset(1).select(["id", "name"]).then(res => {
                    globalVal.name = res[0].name;
                    done();
                });
            }, function (globalVal) {
                it("should return the second row", function () {
                    assert.equal("txm", globalVal.name);
                });
            });

        });
    });

    promiseDescribe("#insert", function (globalVal, done) {
        admin.insert({
            name: "model_insert",
            password: "1234",
        }).then((id) => {
            globalVal.insertId = id;
            done();
        });
    }, function (globalVal) {
        it("should return an insert id ", function () {
            assert.isNumber(globalVal.insertId);
        });
    });

    promiseDescribe("#udpate", function (globalVal, done) {
        admin.where("id", 18).update({
            name: "test_upda'te",
            password: "1234",
        }).then((length) => {
            globalVal.length = length;
            done();
        });
    }, function (globalVal) {
        it("should return number of changed rows", function () {
            assert.isNumber(globalVal.length);
        });
    });

    promiseDescribe("#delete", function (globalVal, done) {
        admin.where("id", 19).delete().then((length) => {
            globalVal.length = length;
            done();
        });
    }, function (globalVal) {
        it.skip("should return the number of affect rows", function () {
            assert.isNumber(globalVal.length);
        });
    });

});

