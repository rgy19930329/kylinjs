'use strict';

const fs = require('fs');
const path = require('path');
const Tag = require('../Tag');
const symbol = require('../symbol');
const nunjucks = require('nunjucks');
/**
 * widget custom
 * 参数:
 *  - $id {String} 必须, 需依赖的组件ID
 *  - $scope {Boolean} 可选, 隔离上层变量, 仅在属性上设置的才传递进去
 *  - 其他变量, 作为子组件的局部变量, 会在子scope里覆盖上层变量
 * @example
 * {% widget "news/detail" %}
 * {% widget $id="news/detail" str="aa" "data-attr1"="another"%}
 */
class WidgetTag extends Tag {
    constructor() {
        super('widget');
        this.end = false;
        this.noRun = true;
    }

    //使用include的方式来引入widget模块
    afterParse(parser, nodes, lexer, args, body) {
        var oo = this.parseArgsNodeList(args);

        var node = new nodes.Include(0, 0);
        node.template = new nodes.Literal(0, 0, oo.name);

        var body = new nodes.NodeList();
        body.addChild(node);
        return new nodes.CallExtension(this, 'run', args, [body]);
    }

    render(context, attrs, body) {
        var obj = attrs[0];
        var name = '';
        if (typeof obj === 'string') {
            name = obj;
        } else if (obj && obj['name']) {
            name = obj['name'];
        }

        try{
            var widgetFilePath = path.resolve(context.env.loaders[0].searchPaths[0], '../' + name);
        }catch(e){
            return '未找到对应组件，请检查组件name';
        }

        try{
            const resource = context.ctx[symbol.RESOURCE];
            var n = name.replace('.html', '');
            var manifest = resource.manifest;
            var res = manifest.res;
            var less = n + '.less';
            var js = n + '.js';
            if (res[js]) {
                resource.addScript(`seajs.use("${js}")`);
            }
            if (res[less]) {
                resource.require(`${n}.less`);
            }
        }catch (e){

        }

        /*
        * todo
        * https://github.com/mozilla/nunjucks/issues/497
        * 如果外层定义了相同变量，会使用外层变量，所以开发时尽量避免在标签中定义变量
        * */
        var oldVar = {};
        for(var k in obj){
            oldVar[k] = context.ctx[k];
            context.setVariable(k, obj[k]);
        }
        
        // var html = body();
        //还原变量
        for(var k in obj){
            context.setVariable(k, oldVar[k]);
        }
        var dataSource = Object.assign({}, context.ctx, obj); // 构造数据源
        var html = context.env.render(name, dataSource);
        return html;
    }

}

module.exports = WidgetTag;
