var path = require("path");
/* 
	Filters .js files... that's all I want...
*/
module.exports = function(name) {
    return /(\.(js)$)/i.test(path.extname(name));
};
