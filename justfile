t: gen
  tree-sitter parse /tmp/htmljinja2.html

cmd *args:
  tree-sitter {{args}}

play: wasm (cmd "play")

wasm: gen (cmd "build --wasm")
  
gen: (cmd "generate")
