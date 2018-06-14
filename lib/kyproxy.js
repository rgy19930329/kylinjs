const _ = require('lodash');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const staticServer = require('koa-static');
const router = require('koa-router')();
const Koa = require('koa');
const routes = require('./routes');
const logger = require('./logger');
const filter = require('./filter');
const template = require('./template');
const httpClient = require('./api-gateway').http;
const isProduct = process.env.NODE_ENV === 'product';

class KYProxy {
  constructor() {
    this.app = null;
    this.router = router;
    this.filters = {};
    this.httpClient = {};
    this.config = {};
    this.addons = [];
    this.helpers = {};
  }

  /**
   * 项目初始设置
   * @param opts
   */
  init(opts) {
    this.options = _.extend({
      name: '',
      appDir: '',
    }, opts);

    this.appDir = opts.appDir;
    //获取package.json
    var pkgFile = path.join(this.appDir, 'package.json');
    try {
      var pkg = require(pkgFile);
    } catch (e) {
      return console.info(e.message);
    }
    this.projectName = this.options.name || pkg.name;

    return this;
  }

  /**
   * 启动服务
   * @returns 
   */
  serverStart() {
    var app = this.createApp();

    this.mountLogger();

    this.logger('||||||^_^ => server warm up...');

    this.mountAddons(() => {
      
      this.logger('addons loaded');
      
      // mountFilter 必须前置于 mountRoutes 才能起到拦截过滤作用

      // mountFilter 必须前置于 mountTemplate 才能起到添加helper的作用

      this.mountFilter();

      // mountTemplate 必须前置于 mountRoutes 才能实现往ctx上绑render方法

      this.mountTemplate();

      this.mountRoutes();

      this.mountApiClient();

      // 静态资源服务
      app.use(staticServer(path.join(this.appDir, '/node_modules/.ky-release-webroot')));

      app.use(bodyParser());

      var port = KY.config.port || 3000;

      app.listen(port);

      this.logger('server is start, port is ' + port);

      this.logger(process.env.NODE_ENV, 'env');
    });
  }

  /**
   * 初始化 app
   * @returns {*}
   */
  createApp() {
    var app = this.app = new Koa();
    return app;
  }

  /**
   * 添加路由
   * @returns {*}
   */
  addRouter(type, [path, httpWay]) {
    this.logger(path);
    this.router[type](path, httpWay);
  }

  /**
   * 安装路由
   * @returns {*}
   */
  mountRoutes() {
    this.logger('routes loading ...');
    routes(this);
    this.app.use(this.router.routes());
  }

  /**
   * 安装logger
   * @returns {*}
   */
  mountLogger() {
    this.logger = logger(this.projectName);
  }

  /**
   * 安装filter
   * @returns {*}
   */
  mountFilter() {
    this.logger('filter loading ...');
    this.app.use(filter(this));
  }

  /**
   * 安装 模板 nunjucks
   * @returns {*} release
   */
  mountTemplate() {
    var releaseDir = path.join(this.appDir, '/node_modules/.ky-release-webroot');
    this.logger('template loading ...');
    this.app.use(
      template(releaseDir, {
        noCache: !isProduct,
        watch: !isProduct,
        filters: this.helpers
      })
    );
  }

  /**
   * 安装 api client
   * @returns {*}
   */
  mountApiClient() {
    this.logger('api client loading ...');
    httpClient(this); // 注册 http 请求
  }

  /**
   * 安装 插件
   * @returns {*}
   */
  async mountAddons(next) {
    this.logger(this.addons, 'addons');
    var count = 0;
    for (var i = 0, len = this.addons.length; i < len; i++) {
      var r = await this.addons[i]();
      if (r.success) {
        count++;
      }
    }
    if(count == this.addons.length) {
      await next();
    }else{
      this.logger('addons 未完全加载...');
      process.exit(0);
    }
  }

  /**
   * 获取项目根目录
   * @returns {*}
   */
  getRoot() {
    return this.appDir;
  }

  /**
   * 获取项目名
   * @returns {*}
   */
  getName() {
    return this.projectName;
  }

  /**
   * 对外暴露 filter 方法
   */
  filter(path, ...cb) {
    this.filters[path] = cb;
  }

  /**
   * 对外暴露 helper 方法
   */
  helper(json) {
    this.helpers = json;
  }

  /**
   * 对外暴露 addon(安装插件) 方法
   * 放在 startServer 方法执行前
   */
  addon(fn) {
    this.addons.push(fn);
    return this;
  }

}

module.exports = KYProxy;
