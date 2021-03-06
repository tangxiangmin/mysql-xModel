let SqlString = require("sqlstring");


exports.formateCondition = function formateCondition(key, logic, value) {
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
};


// 将node内置库方法promise化
exports.promiseify = function promiseify(func, ctx){
    return function(){
        ctx = ctx || this;
        let args = Array.prototype.slice.call(arguments, 0);

        return new Promise((resolve, reject)=>{
            let cb = function(err, res){
                if (err){
                    return reject(err);
                }else {
                    return resolve(res);
                }
            };
            args.push(cb);

            // todo 处理返回值
            func.apply(ctx, args);
        });
    };
};

// 异步测试
exports.promiseDescribe = (describeName, task, assertFunc)=>{
    describe(describeName, function () {
        let globalVal = {};
        beforeEach(function (done) {
            task(globalVal, done);
        });

        if (assertFunc instanceof Array) {
            assertFunc.forEach(func => {
                func(globalVal);
            });
        } else {
            assertFunc(globalVal);
        }
    });
};