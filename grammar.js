/**
 * @file html+jinja2
 * @author Meow King <mr.meowking@posteo.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "htmljinja2",

  rules: {
    source_file: $ => repeat($._node),

    _node: $ => choice(
      $.doctype,
    ),

    doctype: $ => seq(
      '<!',
      alias($._doctype, 'doctype'),
      /[^>]+/,
      '>',
    ),

    _doctype: _ => /DOCTYPE/i,
  }
});
