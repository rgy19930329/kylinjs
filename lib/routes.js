const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * 需要挂载的http tpye
 */
const HTTP_TYPE = [ 'HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE' ];

/**
 * 自动加载路由文件
 * @param routersPath
 */
function autoLoadRoutes(routersPath) {
  fs.readdirSync(routersPath).forEach(function(file) {
    var filePath = path.join(routersPath, file);
    var stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      autoLoadRoutes(filePath);
    } else {
      //console.log(filePath);
      //过滤掉以'.'开头的文件
      if (file[0] != '.') {
        try {
          require(filePath);
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
}

module.exports = (KY) => {
  HTTP_TYPE.forEach(type => {
    var name = type.replace(/(.)(.*)/, (all, $1, $2) => {
      return $1 + $2.toLowerCase();
    });
    KY['on' + name] = function() {
      KY.addRouter(type.toLowerCase(), _.toArray(arguments));
    }
  });
  autoLoadRoutes(path.join(KY.appDir, '/app/routes'));
};
