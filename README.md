# d3-textwrap

wrap long lines of text in SVG images

<a href="http://bl.ocks.org/vijithassar/8278587">demonstration</a>

## Overview

Astonishingly, SVG does not natively provide a way to wrap long lines of text. However, it does provide two mechanisms by which text wrapping can be very tediously implemented.

1. the long text can be split into substrings which are inserted into [tspan](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan) elements, each of which is then positioned individually

2. the text can be added to a [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) which uses HTML instead of SVG to wrap long lines

The first approach can be buggy in Safari, and the second does not work at all in Internet Explorer 10 or below. This plugin implements both solutions, and can switch between them depending on browser support.

## Quick Start

The d3.textwrap method is a factory which returns functions which can then have their wrapping behavior configured, and are then run on a set of text nodes using [selection.call](https://github.com/d3/d3-selection#selection_call).

```js
// create a text wrapping function
var wrap = d3.textwrap().bounds({height: 480, width: 960});
// wrap all text
d3.selectAll('text').call(wrap);
```

## Installing

If you use NPM, `npm install d3-textwrap`. Otherwise, download the [latest release](#).

## API Reference

* [Creating Text Wrapping Functions](#creating)
* [Configuration](#configuring)
* [Running](#running)

### Creating Text Wrapping Functions

<a name="textwrap" href="#textwrap">#</a> d3.*textwrap*

Creates a function that can then be configured and used to wrap text. This allows for varying configurations within the same project.

```js
var wrap = d3.textwrap();
```

### Configuration

<a name="bounds" href="#bounds">#</a> textwrap.**bounds**(*bounds*)

Gets or sets the boundaries within which text will be wrapped. Takes one argument, which can be a DOM node, an object with "height" and "width" properties, or a function which returns an object with "height" and "width" properties. To wrap to a 480×960 pixel rectangle:

```js
var wrap;
// create a text wrapping function
wrap = d3.textwrap()
    // wrap to 480 x 960 pixels
    .bounds({height: 480, width: 960});
```

<a name="padding" href="#padding">#</a> textwrap.**padding**(*padding*)

Gets or sets optional additional padding which will be calculated on top of the bounds before the text wrapping is performed. Takes one argument, which can be a number or a function which returns a number. Note that this does not support CSS units. To pad by 10 pixels, thus bringing the effective dimensions to 460×940:

```js
var wrap;
// create a text wrapping function
wrap = d3.textwrap()
    // wrap to 480 x 960 pixels
    .bounds({height: 480, width: 960})
    // pad by an additional 10 pixels
    .padding(10);
```

<a name="method" href="#method">#</a> textwrap.**method**(*method*)

Gets or sets the name of the text wrapping method to be used, which can be either "foreignobject" or "tspans". If this is not specified, the default behavior is to use foreignobject wrapping for most browser, but fall back to using tspan elements when that is not an available option. With that said, in some scenarios it may also make sense to always use the tspan method in pursuit of consistent behavior.

```js
var wrap;
// create a text wrapping function
wrap = d3.textwrap()
    // wrap to 480 x 960 pixels
    .bounds({height: 480, width: 960})
    // wrap with tspans in all browsers
    .method('tspans');
```

### Running

After configuring a text wrapping function, run it using [selection.call()](https://github.com/d3/d3-selection#selection_call):

```js
var wrap,
    text;
// create a text wrapping function
wrap = d3.textwrap()
    // wrap to 480 x 960 pixels
    .bounds({height: 480, width: 960});
// select all text nodes
text = d3.selectAll('text');
// run the text wrapping function on all text nodes
text.call(wrap);
```

## Alternatives

Gregor Aisch's handy [d3-jetpack](https://github.com/gka/d3-jetpack) toolkit also provides a text wrapping routine which works by counting the number of characters on each line instead of measuring the amount of horizontal space they occupy.