d3textwrap
==========

<h3>OVERVIEW</h3>

<em>in a nutshell</em>

JavaScript plugin to enable automatic line wrapping in SVG images by using text, tspan, and foreignObject elements, as well as computed character length calculations. Include after D3 and call textwrap() on any text node in order to magically line wrap long strings of text to your desired boundaries in the SVG - safe, clean, and cross-browser!

<img src="https://raw.github.com/vijithassar/d3textwrap/master/header-image.jpg">

--

<h3>DESCRIPTION</h3>

<em>in a somewhat larger nutshell</em>

<a href="http://d3js.org">D3.js</a> is an amazing library which can be used to build interactive information and art projects with data sets, JavaScript code, and scalable vector graphics rendered in the web browser. But it faces a very big problem: SVG images do not support line-wrapped text. At all! I know, I know, that's hard to believe, but it's true. This means that it can be very difficult to display longish chunks of text in SVG-based D3 projects.

To very quickly convey how annoying this can be, here's the project description from <a href="#overview">Overview section at the top of this page</a> as it might appear in an SVG, all on one line.

```
JavaScript plugin to enable automatic line wrapping in SVG images by using text, tspan, and foreignObject elements, as well as computed character length calculations. Include after D3 and call textwrap() on any text node in order to magically line wrap long strings of text to your desired boundaries in the SVG - safe, clean, and cross-browser!
```

Except that in the SVG there would be no way to scroll. Oof.

The easiest way to deal with this is to first insert something called a foreignObject into the SVG, which is essentially a generic blob of space into which you can cram whatever else you want. Just append a foreignObject, insert a div tag or a p tag or whatever else inside it, and then let HTML handle the line wrapping just as it would on any web page.

Unfortunately <a href="http://stackoverflow.com/questions/19739672/foreignobject-is-not-working-in-ie10">Internet Explorer does not properly support foreignObject</a>. Surprise!

However, SVG does provide something called tspans, which are basically sub-nodes placed inside the text node of the SVG which can be used to divide a longer string of text into smaller sections. This is even properly supported by Internet Explorer! It's still tough, though, because 1) neither SVG nor D3 give you an easy way to chop the longer text into the smaller segments, and 2) once you've done all your chopping you also have to position each tspan separately, and then 3) the method of positioning is slightly different depending on whether it's the first initial tspan or one that comes later in the set. It's a tremendous pain.

Even worse, there's a <a href="http://stackoverflow.com/questions/9137222/raphael-text-and-safari">silly</a> <a href="http://stackoverflow.com/questions/16701246/why-are-programmatically-inserted-svg-tspan-elements-not-drawn-except-with-d3">bug</a> in Safari wherein it doesn't support the dy attribute on tspan elements, which essentially just means that you can't vertically position them accurately – even if you split them correctly, all the little subsections will appear on the first line, overlapping one another. This includes Mobile Safari on iOS devices.

In other words, if you use the foreignObject approach you're screwed on Internet Explorer, but if you use tspans you're screwed in Safari and on Apple mobile devices like iPhones and iPads. Those are all important browsers to support, and it's impossible to choose between them.

This plugin solves all the above problems. It first tests for foreignObject support and uses the simpler HTML option if it's available. If not, then it will fire a whole long sequence of tests to automatically split your text into whatever subsections will fit within the bounds you've specified, and then handles positioning of all the tspans for you. Safari gets foreignObjects, Internet Explorer gets tspans, all text wraps properly, and you get to go chill out and watch television instead of spending ages debugging this nonsense the way I did – I'm sort of a <em>Law & Order</em> junkie myself, but whatever floats your boat.

--

<h3>QUICK START</h3>

<em>if you already know the ropes</em>

Begin with a single simple text node containing a text string.

```html
<svg>
    <text id="wrapme">All work and no play makes Vijith a dull boy.</text>
    ...
</svg>
```

Then select it and run the plugin's .textwrap() method; more on the bounds argument in the detailed instructions below.

```html
<script type="text/javascript">
    d3.select('text#wrapme').textwrap(bounds);
    ...
</script>
```

In most browsers, the text node will be converted to a foreignObject rendering, so the text would automatically wrap to the dimensions of the div.

```html
<svg>
    <foreignObject requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">
        <div class="wrapped">
            All work and no play makes Vijith a dull boy.    
        </div>
    </foreignObject>
    ...
<svg>
```

But in Internet Explorer and any other browsers that don't handle foreignObjects, the text node is retained and split into tspan subsections, with all the positioning headaches automatically solved.

```html
<svg>
    <text id="wrapme">
        <tspan>All work and no play</tspan>
        <tspan>makes Vijith a dull</tspan>
        <tspan>boy.</tspan>
    </text>
    ...
</svg>
```

-- 

<h3>INSTRUCTIONS</h3>

<em>a detailed implementation guide</em>

1) <a href="https://github.com/vijithassar/d3textwrap/archive/master.zip">Download the plugin</a>, unzip it, and put the textwrap.js file on your server somewhere. Make a note of the URL that points to the plugin, because you'll need it in step 3 below. (I'm not yet providing a hosted version of this, but you can use the <a href="https://raw.github.com/vijithassar/d3textwrap/master/textwrap.js">raw URL provided by GitHub</a> if you really want to. Do so at your own risk! Who knows, I might move or rename that file someday.)

2) Load the D3 library as a script in your HTML document, either the version <a href="http://d3js.org/d3.v3.min.js">hosted remotely</a> or a copy you keep locally.
```html
<html>
    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    ...
</html>
```
3) <b>After you've loaded D3</b>, load the plugin.
```html
<html>
    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://plugin.script.url" charset="utf-8"></script>
    ...
</html>
```
4) <b>After you've loaded both D3 and the plugin</b>, load your D3 project code, either as a remote script tag or inline right on the page.
```html
<html>
    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://plugin.script.url" charset="utf-8"></script>
    <script src="http://project.script.url" charset="utf-8"></script>
    ...
</html>
```
OR
```html
<html>
    <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://plugin.script.url" charset="utf-8"></script>
    <script type="text/javascript">
        // D3 project code goes here
    </script>
    ...
</html>
```
5) The plugin needs to know where and when you want the text wrapping breaks to occur, so you need to define your wrapping boundaries and send them to it. The boundaries can be provided either be a D3 selection which points to a rect element in the SVG, which in many cases may be the easiest solution, or alternatively as a simple JavaScript object which contains the necessary positioning information.
```html
<script type="text/javascript">
    var bounds = d3.select('rect#desired-wrapping-boundaries');
    ...
</script>
```

OR

```html
<script type="text/javascript">
    var bounds = {
        x: 300, // bounding box is 300 pixels from the left
        y: 400, // bounding box is 400 pixels from the top
        width: 500, // bounding box is 500 pixels across
        height: 600 // bounding box is 600 pixels tall
    };
    ...
</script>
```

If you're doing the latter, your bounds must be a simple JavaScript object (aka associative array) with properties (aka keys) for x, y, width, and height, each of which contains an integer value.

6) Once you've defined your bounds, simply call the .textwrap() method on a D3 text selection and pass them as an argument.
```html
<script type="text/javascript">
    d3.select('text#wrapme').textwrap(bounds);
    ...
</script>
```

--

<h3>NOTES</h3>

<em>miscellaneous tips and strategies</em>

1) Rectangular shapes only for now - no circles or wacky polygons at the moment.

2) The class "wrapped" is automatically added to the divs that are inserted into the foreignObject. In the future this might be configurable, but for now it's nice to avoid a litany of input arguments, and it's easy enough to change – just run <a href="https://github.com/mbostock/d3/wiki/Selections#wiki-classed">d3's .classed() method</a> and you can quickly change the class name to whatever else you might want.

3) This plugin can't yet calculate for rounded corners as specified by rx and ry radius attributes on a rect element. You can still use this with rounded rect elements, but if you're not careful your text might bump into those corner boundaries.

4) In many cases it might make sense to create a rect to use as your boundary definition, but then make it invisible through styling. This is an easy way to add padding and margins, for example, since strictly speaking the SVG specification doesn't support them because there's no box model or document flow.

```html
<svg>
    <rect style="fill: none;" id="bounds">
    ...
</svg>
```

5) In order to do animations or elaborate positioning transformations with text that is also line wrapped, you'll probably need to put your text inside a g element and transform that instead. This plugin plays nice with animations if they're handled by upstream transform attributes, but if you're moving the text node around on the page by modifying its attributes directly it's not going to be able to successfully chase it around. In other words, do this:

```html
<svg>
    <g id="animateme">
        <text id="donotanimateme">Text content to wrap</text>
    </g>
    ...
</svg>
```

Not this:

```html
<svg>
    <text id="animateme">Text content to wrap</text>
    ...
</svg>
```

6) Similarly, note that in most cases the bounds should be subject to the same transforms as the text node. It's much simpler this way.

Doing otherwise isn't technically wrong or in any way prohibited, but can be a huge pain to position properly because the rect node and the text node are being moved around without really cooperating.

```html
<svg>
    <rect id="bounds">
    <g transform="translate(100,200)">
        <text id="donotanimateme">Text content to wrap</text>
    </g>
    ...
</svg>
```

Instead, just place your bounds within the same transforms as the text.

```html
<svg>
    <g transform="translate(100,200)">
        <rect id="bounds">
        <text id="donotanimateme">Text content to wrap</text>
    </g>
    ...
</svg>
```

This is also true when your bounds argument is a simple associative array – that is, the integer values in the array should work within the context established by upstream transforms from higher up in the DOM.

7) Just like anything else in D3, the bounds argument can actually be a function instead of a variable. The argument function can either select and return a D3 rect, or assemble and return an associative array. This is an easy way to run a single .textwrap() method on many text selections at once.

It can be inline and anonymous:

```html
<script type="text/javascript">
    d3.select('text').textwrap(function(d, i) {
        // code to dynamically determine bounds
        // for each text node goes here
    });
    ...
</script>
```

It can also be named:

```html
<script type="text/javascript">
    function get_bounds(d, i) {
        // code to dynamically determine bounds
        // for each text node goes here
    }
    d3.select('text').textwrap(get_bounds);
    ...
</script>
```

8) You can't currently animate the width of wrapped text. Or, well, you can, but the wrap boundaries won't necessarily respond – that would require pinging the DOM upon each successive animation tick to retrieve the newly updated boundary size and would probably be horribly inefficient. Even if it did support that, text that's continually reflowing to fit inside boundaries where the width is animating would look weird and would make for a super distracting user interface. Instead, you might try using a zoom effect via transforms, or hiding or adjusting the opacity of your text during the animation and then re-running the .textwrap() method with the updated bounds after the animation is complete.

9) A word about line spacing:

When rendering tspans, the plugin checks the computed styles looking for line-height statements, either inline as an attribute or from an external stylesheet. Ordinarily this wouldn't accomplish anything, because the text node would always render on one line.

```html
<svg>
    <text id="wrapme" style="line-height: 3em">All work and no play makes Vijith a dull boy.</text>
    ...
</svg>
```

After running the .textwrap() method, that instruction, if it's found, will be translated into tspan vertical positioning via the dy attribute. I'm actually not entirely sure whether this is a pixel-perfect match to the measurements that would be rendered by the same statement if applied via CSS, but it should be pretty close.

```html
<svg>
    <text id="wrapme">
        <tspan>All work and no play</tspan>
        <tspan dy="3em">makes Vijith a dull</tspan>
        <tspan dy="3em">boy.</tspan>
    </text>
    ...
</svg>
```

The plugin does not perform any such translation when rewriting as foreignObjects because they already contain HTML which you can style however you want using regular CSS.