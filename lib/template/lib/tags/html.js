'use strict';

const Tag = require('../Tag');
const symbol = require('../symbol');
const Resource = require('../Resource');

/**
 * HTML标签, 初始化一些该次渲染需用到的数据
 * 支持 cdn / doctype 参数.
 * @example
 * {% html cdn="http://cdn.cn" %}content{% endhtml %}
 */
class HtmlTag extends Tag {
    constructor() {
        super('html');
        this.noRun = true;
    }

    afterParse(parser, nodes, lexer, args, body) {
        var attrStr = this.args2attrs(args);
        var start = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, '<html ' + attrStr + '>')]);
        var end = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, '</html>')]);
        body.children.unshift(start);
        body.addChild(end);
        return body;
    }
}

module.exports = HtmlTag;


