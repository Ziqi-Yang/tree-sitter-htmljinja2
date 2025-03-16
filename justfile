t: gen
  tree-sitter parse /tmp/htmljinja2.html

cmd *args:
  tree-sitter {{args}}

test: (cmd "test")

play: wasm (cmd "play")

wasm: gen (cmd "build --wasm")
  
gen: (cmd "generate")
