/**
 * @file html+jinja2
 * @author Meow King <mr.meowking@posteo.com>
 * @license MIT
 * @reference https://github.com/tree-sitter/tree-sitter-html
 * @reference https://github.com/geigerzaehler/tree-sitter-jinja2
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const {
  sep1,
  jinja_statement_start,
  jinja_statement_end,
  jinja_statement,
  jinja_expression_in_statement,
  jinja_keyword,
  jinja_context_specifier
} = require('./utils.js');

module.exports = grammar({
  name: "htmljinja2",

  extras: $ => [
    $.comment,
    /\s+/,
  ],
  
  conflicts: ($) => [
    [$.jinja_elif_statement],
    [$.single_element, $.element]
  ],

  externals: ($) => [
    $._start_tag_name,
    $._script_start_tag_name,
    $._style_start_tag_name,
    $._end_tag_name,
    $.erroneous_end_tag_name,
    '/>',
    $._implicit_end_tag,
    $._raw_text,
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
      $.single_element, // 🐶
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
    
    single_element: $ => choice(
      $.start_tag,
      $.end_tag
    ),
    
    start_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.attribute),
      '>',
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

    
    self_closing_tag: $ => seq(
      '<',
      alias($._start_tag_name, $.tag_name),
      repeat($.attribute),
      '/>',
    ),


    script_element: $ => seq(
      alias($.script_start_tag, $.start_tag),
      alias(repeat(choice(
        $._raw_text,
        $._jinja
      )), $.raw_text),
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
      alias(repeat(choice(
        $._raw_text,
        $._jinja
      )), "raw_text"),
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
      $.jinja_if_statement,
      $.jinja_macro_statement,
      $.jinja_call_statement,
      $.jinja_filter_statement,
      $.jinja_assignment_statement,
      $.jinja_end_assignment_statement,
      $.jinja_extends_statement,
      $.jinja_block_statement,
      $.jinja_include_statement,
      $.jinja_import_statement,
      $.jinja_with_statement,
      $.jinja_raw_statement,
      $.jinja_custom_statement,
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


    jinja_if_statement: $ => seq(
      jinja_statement("if", field("condition", jinja_expression_in_statement($))),
      field("body", repeat($._node)),
      field("elif", repeat($.jinja_elif_statement)),
      choice(field("else", $.jinja_else_statement), jinja_statement("endif")),
    ),

    jinja_elif_statement: $ => seq(
      jinja_statement("elif", field("condition", jinja_expression_in_statement($))),
      repeat($._node),
    ),

    jinja_else_statement: $ => seq(
      jinja_statement("else"),
      field("body", repeat($._node)),
      jinja_statement("endif"),
    ),


    jinja_macro_statement: $ => seq(
      jinja_statement("macro", field("signature", jinja_expression_in_statement($))),
      repeat($._node),
      jinja_statement("endmacro"),
    ),

    jinja_call_statement: $ => seq(
      jinja_statement("call", field("call", jinja_expression_in_statement($))),
      repeat($._node),
      jinja_statement("endcall"),
    ),

    jinja_filter_statement: $ => seq(
      jinja_statement("filter", field("code", jinja_expression_in_statement($))),
      repeat($._node),
      jinja_statement("endfilter"),
    ),

    jinja_assignment_statement: $ => jinja_statement(
      "set", field("code", jinja_expression_in_statement($))
    ),

    jinja_end_assignment_statement: $ => jinja_statement("endset"),

    jinja_extends_statement: $ => jinja_statement(
      "extends", jinja_expression_in_statement($)
    ),

    jinja_block_statement: $ => seq(
      jinja_statement(
        "block",
        field("id", $.jinja_identifier),
        optional(jinja_keyword("scoped")),
        optional(jinja_keyword("required")),
      ),
      repeat($._node),
      jinja_statement("endblock", optional($.jinja_identifier)),
    ),

    jinja_include_statement: $ => jinja_statement(
      "include",
      choice($.jinja_string, $.jinja_identifier),
      optional(alias("ignore missing", "_keyword")),
      optional(jinja_context_specifier()),
    ),

    jinja_import_statement: $ => choice(
      jinja_statement(
        "import",
        field("id", $.jinja_string),
        alias("as", "_keyword"),
        $.jinja_identifier,
        optional(jinja_context_specifier()),
      ),
      jinja_statement(
        "from",
        field("id", $.jinja_string),
        jinja_keyword("import"),
        sep1(
          choice(
            $.jinja_identifier,
            seq($.jinja_identifier, jinja_keyword("as"), $.jinja_identifier),
          ),
          ",",
        ),
        optional(jinja_context_specifier()),
      ),
    ),

    jinja_with_statement: $ => seq(
      jinja_statement(
        "with",
        optional(field("assignment", jinja_expression_in_statement($))),
      ),
      repeat($._node),
      jinja_statement("endwith"),
    ),

    jinja_raw_statement: $ => seq(
      alias(
        token(seq(jinja_statement_start(), /\s*raw\s*/, jinja_statement_end())),
        "raw_start",
      ),
      $.text,
      alias(
        token(seq(jinja_statement_start(), /\s*endraw\s*/, jinja_statement_end())),
        "raw_end",
      ),
    ),

    jinja_custom_statement: $ => prec.dynamic(
      -1,
      seq(
        jinja_statement_start(),
        alias($._jinja_expression_in_statement, $.jinja_custom_tag),
        jinja_statement_end(),
      ),
    ),


    
    jinja_identifier: () => /[\w]+/,

    jinja_string: () => choice(seq(`"`, /[^\"]+/, `"`), seq(`'`, /[^\']+/, `'`)),
    
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
