'use strict';

const Tag = require('../Tag');
const symbol = require('../symbol');
const Resource = require('../Resource');

/**
 * append CSS_HOOK to head
 * @example
 * {% head %}<meta charset="utf-8"/>{% endhead %}
 */
class HeadTag extends Tag {
  constructor() {
    super('head');
    this.noRun = true;
  }

 /* render(context, attrs, body) {
    const resource = context.ctx[symbol.RESOURCE];
    return super.render(context, attrs, [body(), resource.CSS_HOOK].join('\n'));
  }*/
  afterParse(parser, nodes, lexer, args, body){
    var start = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, '<head>')]);
    var end = new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, Resource.CSS_HOOK + '\n</head>')]);
    body.children.unshift(start);
    body.addChild(end);
    return body;
  }
}

module.exports = HeadTag;
