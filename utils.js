export function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function jinja_statement_start() {
  return alias(/\{\%[\+\-]?/, "jinja_statement_start");
}

function jinja_statement_end() {
  return alias(/[\+\-]?\%\}/, "jinja_statement_end");
}

/**
 * Matches something like `{% <kw> ...rest %}`
 */
export function jinja_statement(kw, ...rest) {
  return seq(jinja_statement_start(), jinja_keyword(kw), ...rest, jinja_statement_end());
}

export function jinja_expression_in_statement($) {
  return alias($._jinja_expression_in_statement, $.jinja_expression);
}

export function jinja_keyword(kw) {
  return alias(token(prec(1, kw)), "keyword");
}

function context_specifier() {
  return choice(keyword("with context"), keyword("without context"));
}
