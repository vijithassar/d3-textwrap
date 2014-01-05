/* 

Note: At this time the plugin wrapper for this code is still under development.
The logic will work if carefully transplanted to other projects, but it can't yet
simply be applied to a selection by calling d3.textwrap(). That is the eventual goal,
though – stay tuned!

*/

(function() {

    // create the plugin method twice, both for regular use
    // and again for use inside the enter() selection
    d3.selection.prototype.textwrap = d3.selection.enter.prototype.textwrap = function(bounds) {
    
        // save callee into a variable so we can continue to refer to it 
        // as the function scope changes
        var selection = this;
        
        // check that we have the necessary conditions for this function to operate properly
        if(
            // selection it's operating on cannot be not empty
            (selection.length == 0) ||
            // d3 is available
            (!d3) ||
            // make sure this function has not already been declared
            (typeof d3.selection.prototype.textwrap !== 'undefined') ||
            // desired wrapping bounds must be provided as an input argument
            (!bounds)
        ) {   
            console.log('necessary conditions are not met; exiting without wrapping text');
            return selection;
        } else {
 
            // wrap using html and foreignObjects if they are supported
            function wrap_with_foreign_objects(item) {
                console.log('wrapping with foreign object');
                // establish variables to quickly reference target nodes later
                var parent = d3.select(item.parentNode);
                var text_node = parent.selectAll('text');
                // extract our desired content from the single text element
                var text_to_wrap = text_node.text();
                // remove the text node and replace with a foreign object
                text_node.remove();
                var foreign_object = parent.append('foreignObject');
                // add foreign object and set dimensions, position, etc
                foreign_object
                    .attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
                    .attr('x', x_position)
                    .attr('y', y_position)
                    .attr('width', max_width)
                    .attr('height', max_height)
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
                    .attr('height', max_height)
                    .attr('width', max_width)
                    .attr('style', 'padding:' + padding + 'px;')
                    // insert text content
                    .html(text_to_wrap)
                ;
            }

            // wrap with tspans if foreignObject is undefined
            function wrap_with_tspans(text_node) {
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

            // test for browser support and then switch
            // between the different text wrapping methods
            var wrap_method;        
            if(typeof SVGForeignObjectElement !== 'undefined') {
                wrap_method = wrap_with_foreign_objects;
            } else {
                wrap_method = wrap_with_tspans;
            }
                
            // run the wrap function for each item
            // in the selection
            for(var i = 0; i < selection.length; i++) {
                var item = selection[i];
                wrap_method(item);
            }
        
        }
		
	}
	
})();
