var tape = require('tape'),
    textwrap = require('../').textwrap,
    d3 = require('../'),
    jsdom = require('jsdom').jsdom;

tape('textwrap factory exists', function(test) {
    test.ok(typeof textwrap === 'function');
    test.end();
});

tape('textwrap factory returns a function', function(test) {
    test.ok(typeof textwrap() === 'function');
    test.end();
});

tape('bounds method returns a function', function(test) {
    var wrapper;
    wrapper = textwrap();
    wrapper.bounds({x: 1, y: 1, height: 1, width: 1});
    test.ok(typeof wrapper === 'function');
    test.end();
});

tape('bounds method works as a getter', function(test) {
    var wrapper,
        bounds;
    wrapper = textwrap();
    bounds = {height: 1, width: 1};
    wrapper.bounds(bounds);
    test.ok(wrapper.bounds() === bounds);
    test.end();
});

tape('bounds method rejects invalid input', function(test) {
    var wrapper;
    wrapper = textwrap().bounds({});
    test.ok(wrapper === false);
    test.end();
});

tape('bounds method accepts functions', function(test) {
    var wrapper,
        bounds;
    wrapper = textwrap();
    bounds = function() {
        var result;
        result = {
            x: 1,
            y: 1,
            height: 1,
            width: 2
        };
        return result;
    };
    wrapper.bounds(bounds);
    test.ok(wrapper.bounds()().width === 2);
    test.end();
});

tape('bounds method accepts nodes', function(test) {
    var html,
        wrapper;
    html = '<html><div></div></html>';
    jsdom.env(html, function(error, window) {
        var selection;
        document = global.document = window.document = jsdom(html);
        selection = d3.select('div');
        wrapper = textwrap().bounds(selection.node());
        test.ok(!! wrapper.bounds().nodeType);
        test.end();
    });
});

tape('padding method returns a function', function(test) {
    var wrapper;
    wrapper = textwrap();
    wrapper.padding(1);
    test.ok(typeof wrapper === 'function');
    test.end();
});

tape('padding method works as a getter', function(test) {
    var wrapper,
        padding;
    wrapper = textwrap();
    padding = 10;
    wrapper.padding(padding);
    test.ok(wrapper.padding() === padding);
    test.end();
});