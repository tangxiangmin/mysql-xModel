
/**
 * Created by admin on 2017/7/29.
 */
let logger =  require("./src/logger");
let Model = require("./src/Model");

let admin = new Model("shymean_admin");
//
// admin.where("id", 1).select(["id", "password", "name"]).get().then(res=>{
//     logger.debug(res);
// });
admin.limit(1).offset(1).select(["id", "name"]).get().then(res => {
    logger.debug(admin.latestSql);
    logger.debug(res);
});
