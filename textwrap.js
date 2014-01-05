/* 

Note: At this time the plugin wrapper for this code is still under development.
It works with browsers that support foreignObject, but the logic for handling 
tspans in Internet Explorer and other browsers that don't support foreignObject
has not yet been refactored for the D3 plugin format. That code will work if
carefully transplanted to other projects, and you're welcome to harvest it and
apply it in that manner, but it can't yet simply be applied to a selection by
calling d3.textwrap(). I know that's kind of the whole point! That is the
eventual goal here, of course; stay tuned.

*/

(function() {

    // exit immediately if this has already been defined
    // as a function; the plugin will defer to whatever
    // else you're doing in your code
    if(d3.selection.prototype.textwrap) {
        return false;
    }
    
    var force_wrap_method;
    // set this variable to a string value to always force a particular
    // wrap method for development purposes, for example to check tspan
    // rendering using a foreignobject-enabled browser. set to 'tspan' to 
    // use tspans and 'foreignobject' to use foreignobject
    // force_wrap_method = 'tspans'; // uncomment statement to use tspans
    // force_wrap_method = 'foreignobjects'; // uncomment statement to use foreignobjects
    force_wrap_method = false; // by default no wrap method is forced

    // create the plugin method twice, both for regular use
    // and again for use inside the enter() selection
    d3.selection.prototype.textwrap = d3.selection.enter.prototype.textwrap = function(bounds) {
    
        // save callee into a variable so we can continue to refer to it 
        // as the function scope changes
        var selection = this;
        
        // extract wrap boundaries from any d3-selected rect and return them
        // in a format that matches the simpler object argument option
        var extract_bounds = function(bounds) {
            // discard the nested array wrappers added by d3
            var bounding_rect = bounds[0][0];
            // sanitize the svg element name so we can test against it
            var element_type = bounding_rect.tagName.toString();
            // if it's not a rect, exit
            if(element_type !== 'rect') {
                return false;
            // if it's a rect, proceed to extracting the position attributes
            } else {
                var bounds_extracted = {};
                bounds_extracted.x = d3.select(bounding_rect).attr('x') || 0;
                bounds_extracted.y = d3.select(bounding_rect).attr('y') || 0;
                bounds_extracted.width = d3.select(bounding_rect).attr('width') || 0;
                bounds_extracted.height = d3.select(bounding_rect).attr('height') || 0;
                // also pass along the getter function
                bounds_extracted.attr = bounds.attr;
                return bounds_extracted;
            }
        }

        // double check the input argument for the wrapping
        // boundaries to make sure it actually contains all
        // the information we'll need in order to wrap successfully
        var verify_bounds = function(bounds) {   
            // quickly add a simple getter method so you can use either
            // bounds.x or bounds.attr('x') as your notation,
            // the latter being a common convention among D3
            // developers
            if(!bounds.attr) {
                bounds.attr = function(property) {
                    if(this[property]) {
                        return this[property];
                    }
                }
            }
            // if it's an associative array, make sure it has all the
            // necessary properties represented directly
            if(
                (typeof bounds == 'object') &&
                (bounds.x) &&
                (bounds.y) &&
                (bounds.width) &&
                (bounds.height)
                // if that's the case, then the bounds are fine
            ) {
                // return the lightly modified bounds
                return bounds;
            // if it's a numerically indexed array, assume it's a
            // d3-selected rect and try to extract the positions
            } else if(
                    // first try to make sure it's an array using Array.isArray
                    (
                        (typeof Array.isArray == 'function') &&
                        (Array.isArray(bounds))
                    ) || 
                    // but since Array.isArray isn't always supported, fall
                    // back to casting to the object to string when it's not
                    (Object.prototype.toString.call(bounds) === '[object Array]')
            ) {
                // once you're sure it's an array, extract the boundaries
                // from the rect
                var extracted_bounds = extract_bounds(bounds);
                return extracted_bounds;
            } else {
            // but if the bounds are neither an object nor a numerical 
            // array, then the bounds argument is invalid and you'll
            // need to fix it
                return false;
            }
        }
        
        var verified_bounds = verify_bounds(bounds);

        // check that we have the necessary conditions for this function to operate properly
        if(
            // selection it's operating on cannot be not empty
            (selection.length == 0) ||
            // d3 must be available
            (!d3) ||
            // desired wrapping bounds must be provided as an input argument
            (!bounds) ||
            // input bounds must validate
            (!verified_bounds)
        ) {   
            // try to return the calling selection if possible
            // so as not to interfere with methods downstream in the 
            // chain
            if(selection) {
                return selection;
            // if all else fails, just return false. if you hit this point then you're
            // almost trying to call the textwrap() method on something that
            // doesn't make sense!
            } else {
                return false;
            }
        // if we've validated everything then we can finally proceed
        // to the meat of this operation
        } else {
        
            // reassign the verified bounds as the set we want
            // to work with from here on; this ensures that we're
            // using the same data structure for our bounds regardless
            // of whether the input argument was a simple object or
            // a d3 selection
            bounds = verified_bounds;
                     
            // wrap using html and foreignObjects if they are supported
            var wrap_with_foreignobjects = function(item) {
                console.log('wrapping with foreign object');
                // establish variables to quickly reference target nodes later
                var parent = d3.select(item[0].parentNode);
                var text_node = parent.selectAll('text');
                // extract our desired content from the single text element
                var text_to_wrap = text_node.text();
                // remove the text node and replace with a foreign object
                text_node.remove();
                var foreign_object = parent.append('foreignObject');
                // add foreign object and set dimensions, position, etc
                foreign_object
                    .attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
                    .attr('x', bounds.x)
                    .attr('y', bounds.y)
                    .attr('width', bounds.width)
                    .attr('height', bounds.height)
                ;
                // insert an HTML div
                var wrap_div = foreign_object
                    .append('xhtml:div')
                    // this class is currently hardcoded
                    // probably not necessary but easy to 
                    // override using .classed() and for now
                    // it's nice to avoid a litany of input
                    // arguments
                    .attr('class', 'wrapped')
                ;			
                // set div to same dimensions as foreign object
                wrap_div
                    .style('height', bounds.height)
                    .style('width', bounds.width)
                    // insert text content
                    .html(text_to_wrap)
                ;
            }

            // wrap with tspans if foreignObject is undefined
            var wrap_with_tspans = function(text_node) {
                console.log('wrapping with tspans');
                // only fire the rest of this if the text content
                // overflows the desired dimensions
                if(this.getBBox().width > max_width) {
                    // store whatever is inside the text node 
                    // in a variable and then zero out the 
                    // initial content; we'll reinsert in a moment
                    // using tspan elements.
                    var text_node = d3.select(this);					
                    var text_to_wrap = text_node.text();
                    text_node.text('');
                
                    if(text_to_wrap) {
                        // split at spaces to create an array of individual words
                        var text_to_wrap_array;
                        if(text_to_wrap.indexOf(' ') !== -1) {
                            text_to_wrap_array = text_to_wrap.split(' ');
                        } else {
                            // if there are no spaces, chop it in half.
                            // this is a hack! better to apply
                            // CSS word-break: break-all in order
                            // to handle long single-word strings that
                            // might overflow without spaces. will fix to
                            // dynamically compute the appropriate number
                            // of cuts later.
                            var string_length = text_to_wrap.length;
                            var midpoint = parseInt(string_length / 2);
                            var first_half = text_to_wrap.substr(0, midpoint);
                            var second_half = text_to_wrap.substr(midpoint, string_length);
                            text_to_wrap_array = [first_half, second_half];
                        }
                    
                        // new array where we'll store the words re-assembled into
                        // substrings that have been tested against the desired
                        // maximum wrapping width
                        var substrings = [];
                        // computed text length is arguably incorrectly reported for
                        // all tspans after the first one, in that they will include
                        // the width of previous separate tspans. to compensate we need
                        // to manually track the computed text length of all those
                        // previous tspans and substrings, and then use that to offset
                        // the miscalculation. this then gives us the actual correct
                        // position we want to use in rendering the text in the SVG.
                        var offset = 0;
                        // loop through the words and test the computed text length
                        // of the string against the maximum desired wrapping width
                        for(var i = 0; i < text_to_wrap_array.length; i++) {
                            var word = text_to_wrap_array[i];
                            var previous_string = text_node.text();
                            var previous_width = this.getComputedTextLength();
                            // initialize the current word as the first word
                            // or append to the previous string if one exists
                            var new_string;
                            if(previous_string) {
                                new_string = previous_string + ' ' + word;
                            } else {
                                new_string = word;
                            }
                            // add the newest substring back to the text node and
                            // measure the length
                            text_node.text(new_string);
                            var new_width = this.getComputedTextLength();
                            // adjust the length by the offset we've tracked
                            // due to the misreported length discussed above
                            var test_width = new_width - offset;
                            // if our latest version of the string is too 
                            // big for the bounds, use the previous
                            // version of the string (without the newest word
                            // added) and use the latest word to restart the
                            // process with a new tspan
                            if(test_width > max_width) {
                                if(previous_string !== '') {
                                    var temp = {string: previous_string, width: previous_width - offset};
                                    substrings.push(temp);
                                    offset = offset + previous_width;
                                    text_node.text('');
                                    text_node.text(word);
                                }
                            }
                            // if we're up to the last word in the array,
                            // get the computed length as is without
                            // appending anything
                            if(i == text_to_wrap_array.length - 1) {
                                var final_string = new_string.substr(previous_string.length);
                                // remove leading spaces if present
                                if(final_string.substr(0, 1) == ' ') {
                                    final_string = final_string.substr(1);
                                }
                                if(final_string !== '') {
                                    if((new_width - offset) > 0) {new_width = new_width - offset}
                                    var temp = {string: final_string, width: new_width};
                                    substrings.push(temp);
                                    text_node.text('');
                                }
                            } 
                        }
                        // double check that there are no empty substrings
                        // because those would create blank tspans
                        var substrings_clean = [];
                        for(var i = 0; i < substrings.length; i++) {
                            if(substrings[i].string.length > 0) {
                                substrings_clean.push(substrings[i]);
                            }
                        }
                        // append each substring as a tspan					
                        var current_tspan;
                        var tspan_count;
                        for(var i = 0; i < substrings_clean.length; i++) {
                            var substring = substrings_clean[i].string;
                            if(i > 0) {
                                var previous_substring = substrings_clean[i - 1];
                            }
                            current_tspan = text_node.append('tspan')
                                .text(substring)
                            ;
                            current_tspan
                                .attr('dy', function(d) {
                                    if(i > 0) {
                                        // line height shouldn't be hard coded
                                        // will fix this later
                                        return '1.5em';
                                    }
                                })
                            ;
                            // shift left from default position, which 
                            // is probably based on the full length of the
                            // text string until we make this adjustment
                            current_tspan
                                .attr('dx', function() {
                                    var render_offset = 0;
                                    if(i > 0) {
                                        render_offset = 0;
                                        for(j = 0; j < i; j++) {
                                            render_offset += substrings[j].width;
                                        }
                                    }
                                    return render_offset * -1;
                                })
                            ;
                        }
                    }
                }
            }

            // variable used to hold the functions that let us
            // switch between the wrap methods
            var wrap_method;

            // if a wrap method if being forced, assign that
            // function
            if(force_wrap_method) {        
                if(force_wrap_method == 'foreignobjects') {
                    wrap_method = wrap_with_foreignobjects;
                } else if (force_wrap_method == 'tspans') {
                    wrap_method = wrap_with_tspans;
                }
            }

            // if no wrap method is being forced, then instead
            // test for browser support of foreignobject and
            // use whichever wrap method makes sense accordingly
            if(!force_wrap_method) {
                if(typeof SVGForeignObjectElement !== 'undefined') {
                    wrap_method = wrap_with_foreignobjects;
                } else {
                    wrap_method = wrap_with_tspans;
                }
            }
                
            // run the desired wrap function for each item
            // in the d3 selection that called .textwrap()
            for(var i = 0; i < selection.length; i++) {
                var item = selection[i];
                wrap_method(item);
            }
        
        }
		
    }
	
})();
