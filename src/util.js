
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
            func.apply(ctx, args);
        });
    };
};