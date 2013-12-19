d3textwrap
==========

<h3>IN A NUTSHELL</h3>

JavaScript plugin to enable automatic line wrapping in SVG images by using text, tspan, and foreignObject elements, as well as computed character length calculations. Include after D3 and call textwrap() on any text node in order to magically wrap text - safe, clean, and cross-browser!

--

<h3>IN A CONSIDERABLY LARGER NUTSHELL</h3>

<a href="http://d3js.org">D3.js</a> is an amazing library which can be used to build interactive information and art projects with data sets, JavaScript code, and scalable vector graphics rendered in the web browser. Unfortunately it has a very big problem: SVG images do not support line-wrapped text. At all! I know, I know, that's hard to believe, but it's true.

The easiest way to deal with this is to insert something called a foreignObject into the SVG, which is essentially a generic blob of space into which you can insert whatever you want. Just initialize a foreignObject, insert an HTML div, and let HTML handle the line wrapping just like it would on any web page.

Unfortunately <a href="http://stackoverflow.com/questions/19739672/foreignobject-is-not-working-in-ie10">Internet Explorer</a> does not properly support foreignObject. Surprise!

However, SVG does provide something called tspans, which are basically sub-nodes placed inside the text portion of the SVG which can be used to divide a longer string of text into smaller sections. This is even properly supported by Internet Explorer! However, with longer text content that approach becomes a huge pain, because neither SVG nor D3 give you an easy way to chop the longer text into the smaller segments, and once you've done all your chopping you also have to position each tspan separately, and then the method of positioning is slightly different depending on whether it's the first initial tspan or one that comes later in the set. It's a tremendous pain.

Even worse, there's a <a href="http://stackoverflow.com/questions/9137222/raphael-text-and-safari">silly</a> <a href="http://stackoverflow.com/questions/16701246/why-are-programmatically-inserted-svg-tspan-elements-not-drawn-except-with-d3">bug</a> in Safari wherein it doesn't support the dy attribute on tspans, which essentially just means that you can't vertically position them accurately. This includes Mobile Safari on iOS devices. In other words, if you use the foreignObject approach you're screwed on Internet Explorer, but if you use tspans you're screwed in Safari and on Apple mobile devices. Both are very important browsers to support!

This plugin solves all the above problems. It first tests for foreignObject support and uses the simple HTML option if it's available. If not, then it will fire a whole long sequence of tests to automatically split your text into whatever subsections will fit within the bounds you've specified, and then handles all the positioning of the tspans for you.

--

<h3>WITH MY SINCEREST REGRETS</h3>

The logic here works and has been battle-tested in a high-traffic public D3 infographic project, but the current implementation is still broken because I haven't fully converted it from the initial idiosyncratic version into a more flexible plugin. I'm working on it! In the meantime, feel free to holler at me at @vijithassar if you need help with this sort of thing.
