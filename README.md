# tree-sitter-htmljinja2

An opinionated html+jinja2 grammar, made for easy integration with editors.

Jinja template doesn't have major difference between Django template, so you can
also use it to edit Django files.

## Rules

- **Jinja expression should be placed in scopes**

For example, you can write 

```jinja
<ul id="{{ v }}">
```

but you cannot write

```jinja
<ul id="{{ '"' }}>
```

- **Jinja expressions cannot split `script` and `style` tag**

For example, you can write

```jinja
<script>
{{ v }}
</script>
```

but you cannot write

```jinja
{% if true %}
<script>
{% endif %}

{% if true %}
</script>
{% endif %}
```

## Editor Integration:

Emacs: [htmljinja2-ts-mode](https://codeberg.org/meow_king/htmljinja2-ts-mode)

## Play with this grammar

```
tree-sitter play
```

## Limitations

For paired HTML element splitting, we currently only allow split it in Jinja `if`
expression. For example,

```jinja
{% if true %}
<div>
{% else }
<div>
{% endif %}

{% if true %}
</div>
{% endif %}
```

You should also don't put too much elements inside these spans since it may pair wrong
elements like `<div>` matches `</ul>`.

Though, it does bring some benefits other than precision, such as 3x performance boost
compared to allowing split elements everywhere.


## Reference

- [geigerzaehler/tree-sitter-jinja2](https://github.com/geigerzaehler/tree-sitter-jinja2)
- [tree-sitter/tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html)



