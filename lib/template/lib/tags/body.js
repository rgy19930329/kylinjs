'use strict';

const Tag = require('../Tag');
const symbol = require('../symbol');
const Resource = require('../Resource');

/**
 * append JS_HOOK to body
 * @example
 * {% body %}test{% endbody %}
 */
class BodyTag extends Tag {
    constructor() {
        super('body');
        this.noRun = true;
    }

    afterParse(parser, nodes, lexer, args, body) {
        var attrStr = this.args2attrs(args);
        var tagStart = '<body ' + attrStr + '>';
        var subNodes = this.parseCustomSymbol(tagStart);
        // var start = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, '<body '), new nodes.Symbol(0, 0,  'bodyClass') , new nodes.TemplateData(0, 0,  '>')]);
        var start = new nodes.Output(0, 0, subNodes);

        var end = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, Resource.JS_HOOK + '\n</body>')]);
        body.children.unshift(start);
        //body.addChild(tmp);
        body.addChild(end);
        //转换成block
        var node = new nodes.Block(0, 0);
        node.name = 'body';
        node.body = body;

        return node;
    }

    render(context, attrs, body) {
        const resource = context.ctx[symbol.RESOURCE];
        return super.render(context, attrs, [body(), resource.JS_HOOK].join('\n'));
    }

    //解析变量
    parseCustomSymbol(src) {
        var root = this.nunjucks.parser.parse(src);
        var res = [];
        //将多个 output的内容放到数据并返回；
        root.children.forEach(output=> {
            var children = output.children;
            if (children && children[0]) {
                res.push(children[0])
            }
        });
        return res;
    }
}

module.exports = BodyTag;
