const path = require('path');
const nunjucks = require('nunjucks');
const pagelet = require('./lib/pagelet');
const symbol = require('./lib/symbol');
const Resource = pagelet.Resource;

function createEnv(releaseDir, opts) {
  var autoescape = opts.autoescape && true,
    watch = opts.watch || false,
    noCache = opts.noCache || false,
    throwOnUndefined = opts.throwOnUndefined || false;

  var env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(releaseDir, {
      noCache: noCache,
      watch: watch
    }), {
      autoescape: autoescape,
      throwOnUndefined: throwOnUndefined
    }
  );

  pagelet.configure({
    root: releaseDir,
    manifest: path.join(releaseDir, 'manifest.json'),
    // cache: true
  });

  // 自定义标签
  pagelet.register(env, nunjucks);
  
  if (opts.filters) {
    for (var f in opts.filters) {
      env.addFilter(f, opts.filters[f]);
    }
  }
  return env;
}

function template(releaseDir, opts) {
  // 创建Nunjucks的env对象:
  var env = createEnv(releaseDir, opts);

  return async(ctx, next) => {
    var resource = new Resource();
    // 给ctx绑定render函数:
    ctx.render = function(view, model) {
      // 把render后的内容赋值给response.body:
      var resourceJson = {};
      resourceJson[symbol.RESOURCE] = resource;
      var html = env.render(view, Object.assign({}, 
        ctx.state || {}, 
        model || {},
        resourceJson
      ));
      ctx.response.body = !!html ? resource.render(html) : '模板语法错误';
      // 设置Content-Type:
      ctx.response.type = 'text/html';
    };

    ctx.send = function(json) {
      ctx.response.body = json;
    }
    // 继续处理请求:
    await next();
  };
}

module.exports = template;
