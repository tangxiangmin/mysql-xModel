/**
 * Created by admin on 2017/7/29.
 */
let assert = require("chai").assert;
let DB = require("../src/DB");

let promiseDescribe = require("../src/util").promiseDescribe;

describe("DB", function () {
    promiseDescribe("#get", function (globalVal, done) {
        DB.get().then(result => {
            globalVal.length = result.length;
            done();
        });
    }, function (globalVal) {
        it("should return rows", function () {
            assert.isNumber(globalVal.length);
        });
    });

    promiseDescribe("#select", function (globalVal, done) {
        DB.selelct("SELECT * FROM shymean_admin WHERE id = ?", [1]).then(result => {
            globalVal.id = result[0].id;
            done();
        });
    }, function (globalVal) {
        it("should return root account", function () {
            assert.equal(1, globalVal.id);
        });
    });

    promiseDescribe("#insert", function (globalVal, done) {
        DB.insert("INSERT INTO shymean_admin SET ?", {
            name: "test",
            password: "test",
            purview: "-1"
        }).then(result => {
            globalVal.id = result;
            done();
        });
    }, function (globalVal) {
        it("should return an insertId", function () {
            assert.isNumber(globalVal.id);
        });
    });

    context("#update", function () {
        promiseDescribe("update row", function (globalVal, done) {
            DB.update("UPDATE shymean_admin SET ? WHERE ?", [{
                name: "test_update",
                purview: "1"
            }, {
                id: 11
            }]).then(result => {
                globalVal.length = result;
                done();
            });
        }, function (globalVal) {
            it.skip("should return the number of changed rows", function () {
                assert.isNumber(globalVal.length);
            });
        });

        promiseDescribe("update the same row", function (globalVal, done) {
            DB.update("UPDATE shymean_admin SET ? WHERE ?", [{
                name: "test_update",
                purview: "1"
            }, {
                name: "test_update"
            }]).then(result => {
                globalVal.length = result;
                done();
            });
        }, function (globalVal) {
            it("should return 0 when no rows has changed", function () {
                assert.equal(0, globalVal.length);
            });
        });
    });

    context("#delete", function () {
        promiseDescribe("remove a row", function (globalVal, done) {
            DB.delete("DELETE FROM shymean_admin WHERE ?", {
                id: 15,
            }).then(result => {
                globalVal.length = result;
                done();
            });
        }, function (globalVal) {
            it.skip("should return the number of affect rows", function () {
                assert.equal(1, globalVal.length);
            });
        });
        promiseDescribe("remove a non-existent row", function (globalVal, done) {
            DB.delete("DELETE FROM shymean_admin WHERE ?", {
                id: 15,
            }).then(result => {
                globalVal.length = result;
                done();
            });
        }, function (globalVal) {
            it("should return 0 when delete non-existent rows", function () {
                assert.equal(0, globalVal.length);
            });
        });
    });

});