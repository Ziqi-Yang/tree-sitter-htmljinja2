# tree-sitter-htmljinja2

An opinionated html+jinja2 grammar, made for easy integration with editors.

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



## Reference

[geigerzaehler/tree-sitter-jinja2](https://github.com/geigerzaehler/tree-sitter-jinja2)
[tree-sitter/tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html)



