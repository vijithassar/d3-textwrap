d3textwrap
==========

<h3>IN A NUTSHELL</h3>

JavaScript plugin to enable automatic line wrapping in SVG images by using text, tspan, and foreignObject elements, as well as computed character length calculations. Include after D3 and call textwrap() on any text node in order to magically line wrap long strings of text to your desired boundaries in the SVG - safe, clean, and cross-browser!

<a href="#with-my-sincerest-regrets">This is a work in progress.</a>

--

<h3>IN A CONSIDERABLY LARGER NUTSHELL</h3>

<a href="http://d3js.org">D3.js</a> is an amazing library which can be used to build interactive information and art projects with data sets, JavaScript code, and scalable vector graphics rendered in the web browser. But it faces a very big problem: SVG images do not support line-wrapped text. At all! I know, I know, that's hard to believe, but it's true. This means that it can be very difficult to display longish chunks of text in SVG-based D3 projects.

To quickly give you an idea how annoying this is, here's the summary from the top of this page as it would appear in an SVG.

<div style="white-space:nowrap;">
JavaScript plugin to enable automatic line wrapping in SVG images by using text, tspan, and foreignObject elements, as well as computed character length calculations. Include after D3 and call textwrap() on any text node in order to magically line wrap long strings of text to your desired boundaries in the SVG - safe, clean, and cross-browser!
</div>

The easiest way to deal with this is to first insert something called a foreignObject into the SVG, which is essentially a generic blob of space into which you can cram whatever else you want. Just initialize a foreignObject, insert a div tag or a p tag or whatever else, and let HTML handle the line wrapping just like it would on any web page.

Unfortunately <a href="http://stackoverflow.com/questions/19739672/foreignobject-is-not-working-in-ie10">Internet Explorer does not properly support foreignObject</a>. Surprise!

However, SVG does provide something called tspans, which are basically sub-nodes placed inside the text node of the SVG which can be used to divide a longer string of text into smaller sections. This is even properly supported by Internet Explorer! It's still tough, though, because 1) neither SVG nor D3 give you an easy way to chop the longer text into the smaller segments, and 2) once you've done all your chopping you also have to position each tspan separately, and then 3) the method of positioning is slightly different depending on whether it's the first initial tspan or one that comes later in the set. It's a tremendous pain.

Even worse, there's a <a href="http://stackoverflow.com/questions/9137222/raphael-text-and-safari">silly</a> <a href="http://stackoverflow.com/questions/16701246/why-are-programmatically-inserted-svg-tspan-elements-not-drawn-except-with-d3">bug</a> in Safari wherein it doesn't support the dy attribute on tspan elements, which essentially just means that you can't vertically position them accurately – even if you split them correctly, all the little subsections will appear on the first line, overlapping one another. This includes Mobile Safari on iOS devices. In other words, if you use the foreignObject approach you're screwed on Internet Explorer, but if you use tspans you're screwed in Safari and on Apple mobile devices like iPhones and iPads. Those are all important browsers to support, and it's impossible to choose between them.

This plugin solves all the above problems. It first tests for foreignObject support and uses the simpler HTML option if it's available. If not, then it will fire a whole long sequence of tests to automatically split your text into whatever subsections will fit within the bounds you've specified, and then handles positioning of all the tspans for you. Safari gets foreignObjects, Internet Explorer gets tspans, all text wraps properly, and you get to go watch television and enjoy a snack instead of spending ages debugging this nonsense the way I did.

-- 

<h3>INSTRUCTIONS</h3>

1) <a href="https://github.com/vijithassar/d3textwrap/archive/master.zip">Download the plugin</a>, unzip it, and put the textwrap.js file on your server somewhere (I'm not yet providing a hosted version). Make a note of the URL that points to the plugin, because you'll need it in step 3 below.

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
5) Figure out your wrapping boundaries. This can either be a D3 selection which points to a <rect> element in the SVG, which in many cases may be the easiest solution, or alternatively you can also provide a simple JavaScript object which contains the necessary positioning information.
```html
<script>
    var bounds = d3.select('rect#desired-wrapping-boundaries');
    ...
</script>
```
OR
```html
<script>
    var bounds = {
        x: 300, // bounding box is 300 pixels from the left
        y: 400, // bounding box is 400 pixels from the top
        width: 500, // bounding box is 500 pixels across
        height: 600 // bounding box is 600 pixels tall
    };
    ...
</script>
```
6) Once you've defined your bounds, simply call the .textwrap() method on a D3 text selection and pass them as an argument.
```html
<script>
    d3.select('text#wrapme').textwrap(bounds);
    ...
</script>
```

<h5>MISCELLANEOUS USAGE NOTES</h5>

Rectangular shapes only for now - no circles or wacky polygons at the moment.

This plugin can't yet calculate for rounded corners as specified by rx and ry radius attributes on a rect element. You can still use this with rounded rect elements, but if you're not careful your text might bump into those corner boundaries.

In many cases it might make sense to create a rect to use as your boundary definition, but then make it invisible through styling. This is an easy way to add padding and margins, for example, since strictly speaking the SVG specification doesn't support them because there's no box model or document flow.

```html
<svg>
    <rect style="fill: none;" id="bounds">
    ...
</svg>
```

In order to do animations or elaborate positioning transformations with text that is also line wrapped, you'll probably need to put your text inside a g element and transform that instead. This plugin plays nice with animations if they're handled by upstream transform attributes, but if you're moving the text node around on the page by modifying its attributes directly it's not going to be able to successfully chase it around. In other words, do this:

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

You can't currently animate the width of wrapped text. Or, well, you can, but the wrap boundaries won't necessarily respond – that would require pinging the DOM upon each successive animation tick to retrieve the newly updated boundary size and would probably be horribly inefficient. Even if it did support that, text that's continually reflowing to fit inside boundaries where the width is animating would look weird and would make for a super distracting user interface. Instead, you might try using a zoom effect via transforms, or hiding or adjusting the opacity of your text during the animation and then re-running the .textwrap() method with the updated bounds after the animation is complete.

<h3>WITH MY SINCEREST REGRETS</h3>
The logic for text wrapping in Internet Explorer using tspan elements is still kinda broken here. That portion of the code totally works, and has even been battle-tested in a very high-traffic infographic project, but I haven't fully converted it from that initial idiosyncratic version into the plugin structure. You're obviously free to pilfer it and paste it directly into your projects if you need a solution ASAP, but I'm still working on calling that functionality via the .textwrap() method provided by this plugin. I'm aware that this part is basically the whole point of this thing existing in the first place! Please stay tuned, I'll put it all together soon enough...