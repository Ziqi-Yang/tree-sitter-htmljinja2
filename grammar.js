/**
 * @file html+jinja2
 * @author Meow King <mr.meowking@posteo.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const { sep1, jinja_statement, jinja_expression_in_statement, jinja_keyword } = require('./utils.js');

module.exports = grammar({
  name: "htmljinja2",

  extras: $ => [
    $.comment,
    /\s+/,
  ],


  externals: ($) => [
    $._start_tag_name,
    $._script_start_tag_name,
    $._style_start_tag_name,
    $._end_tag_name,
    $.erroneous_end_tag_name,
    '/>',
    $._implicit_end_tag,
    $.raw_text,
    $.comment,
  ],


  rules: {
    source_file: $ => repeat($._node),

    _node: $ => choice(
      $.doctype,
      $.script_element,
      $.style_element,
      $.erroneous_end_tag,
      $.element,
      $.entity,
      $.text,
      $._jinja
    ),
    
    // HTML ==================================================================
    doctype: $ => seq(
      '<!',
      alias($._doctype, 'doctype'),
      /[^>]+/,
      '>',
    ),

    _doctype: _ => /DOCTYPE/i,

    element: $ => choice(
      seq(
        $.start_tag,
        repeat($._node),
        choice($.end_tag, $._implicit_end_tag),
      ),
      $.self_closing_tag,
    ),

    start_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.attribute),
      '>',
    ),

    self_closing_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.attribute),
      '/>',
    ),


    script_element: $ => seq(
      alias($.script_start_tag, $.start_tag),
      optional($.raw_text),
      $.end_tag,
    ),
    
    script_start_tag: $ => seq(
      '<',
      alias($._script_start_tag_name, $.tag_name),
      repeat($.attribute),
      '>',
    ),
    

    style_element: $ => seq(
      alias($.style_start_tag, $.start_tag),
      optional($.raw_text),
      $.end_tag,
    ),
    
    style_start_tag: $ => seq(
      '<',
      alias($._style_start_tag_name, $.tag_name),
      repeat($.attribute),
      '>',
    ),



    attribute: $ => seq(
      $.attribute_name,
      optional(seq(
        '=',
        choice(
          $.attribute_value,
          $.quoted_attribute_value,
        ),
      )),
    ),

    attribute_name: $ => choice(
      prec(-1, /[^<>"'/=\s\{]+/),
      prec(1, $._jinja)
    ),
    attribute_value: $ => choice(
      /[^<>"'=\s\{]+/,
      $._jinja
    ),


    quoted_attribute_value: $ => choice(
      seq('\'', alias(
        optional(repeat1(choice(
          /[^'\{]+/,
          // Handle single curly braces as text
          /\{/,
          // tree sitter will choose $._jinja rather than single \{, I don't know why,
          // but it works XD
          $._jinja
        ))),
        "attribute_value"
      ), '\''),
      seq('"', alias(
        optional(repeat1(choice(
          /[^"\{]+/,
          /\{/,
          $._jinja
        ))),
        "attribute_value"
      ), '"'),
    ),

    
    end_tag: $ => seq(
      '</',
      alias($._end_tag_name, $.tag_name),
      '>',
    ),

    erroneous_end_tag: $ => seq(
      '</',
      $.erroneous_end_tag_name,
      '>',
    ),

    entity: _ => /&(#([xX][0-9a-fA-F]{1,6}|[0-9]{1,5})|[A-Za-z]{1,30});?/,
    
    // JinJa2 ==================================================================

    _jinja: $ => choice(
      $._jinja_statement,
      $.jinja_output,
      $.jinja_comment
    ),

    _jinja_expression_in_statement: () => repeat1(/[^\s\%\-\+]+|[\%\-\+]/),
    
    jinja_output: ($) =>
      seq("{{", alias(optional($._jinja_output_code), $.jinja_expression), "}}"),
    _jinja_output_code: () => prec.right(repeat1(/[^\s\}\-\+]+|[\}\-\+]/)),

    _jinja_statement: $ => choice(
      $.jinja_for_statement,
    ),

    jinja_for_statement: $ => seq(
      jinja_statement("for", field("iteration", jinja_expression_in_statement($))),
      field("body", repeat($._node)),
      choice($.jinja_for_else_statement, jinja_statement("endfor")),
    ),

    jinja_for_else_statement: $ => seq(
      jinja_statement("else"),
      field("body", repeat($._node)),
      jinja_statement("endfor"),
    ),

    jinja_comment: () => seq("{#", repeat(/[^\#]+|[\#]/), "#}"),

    

    // Common ==================================================================
    text: (_) =>
      prec.right(
        repeat1(
          choice(
            // Single open brace with low precedence (similar to Jinja2 rule)
            token(prec(-1, /\{/)),
        
            // Text content that respects both HTML and Jinja2 special characters
            token(prec(1, /[^<>&\s\{][^<>&\{]*[^<>&\s\{]?/)),
          )
        ),
      ),
  }
});
