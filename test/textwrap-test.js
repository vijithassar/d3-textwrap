var tape = require("tape"),
    textwrap = require("../").textwrap;
    
tape("textwrap exists", function(test) {
  test.ok(typeof textwrap === 'function');
  test.end();
});
