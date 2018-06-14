/**
 * 封装 http(s) 请求
 * @returns {*}
 */

const path = require('path');
const http = require('http');
const https = require('https');
const querystring = require('querystring');

var fixQuery = (path, params) => {
  var paramStr = querystring.stringify(params);
  if(path.match(/\?/)) {
    path = path.slice(0, path.indexOf('?'));
  }
  return path + '?' + paramStr;
}

var httpLoadData = (options) => {
  var protocol = options.port === 443 ? https : http;
  return async (params) => {
    var paramStr = querystring.stringify(params || {});
    var map = {
      'get': function() {
        options.path = fixQuery(options.path, params);
      },
      'post': function() {
        options.headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(paramStr)
        }
      }
    }
    map[options.method.toLowerCase()]();
    return new Promise((resolve, reject) => {
      var req = protocol.request(options, function(res) {
        var json = '';
        res.on('data', function(chunk) {
          json += chunk;
        });
        res.on('end', function() {
          try {
            json = JSON.parse(json);
            resolve(json);
          } catch(e) {
            resolve(json);
          }
        });
        res.on('error', function(err) {
          reject(err);
        });
      });
      req.write(paramStr);
      req.end();
    });
  }
}

module.exports = (KY) => {
  const httpOptions = require(path.join(KY.appDir, '/app/schema/http'));
  // KY.logger(httpOptions);
  for (var method in httpOptions) {
    var item = httpOptions[method];
    var options = {
      hostname: item.server.host,
      port: item.server.port,
      path: item.path,
      method: item.method
    }
    KY.httpClient[method] = httpLoadData(options);
  }
}
