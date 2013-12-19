// er, d and i will not be our input arguments when this is properly
// converted into a flexible plugin – you'll just call it in on a text
// selection.

function textwrap(d, i) {

		// if we have foreign objects available, insert with a div
		if(typeof SVGForeignObjectElement !== 'undefined')
		 {
			// establish variables to quickly reference target nodes later
			var parent = d3.select(this.parentNode);
			var text_node = parent.selectAll('text');
			// extract our desired content from the single text element
			var text_to_wrap = text_node.text();
			// remove the text node and replace with a foreign object
			text_node.remove();
			var foreign_object = parent.append('foreignObject');
			// initialize foreign object and set dimensions, position, etc
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
				
		// if we can't just insert foreign objects, 
		// jump through hoops to separate into tspans
		if(typeof SVGForeignObjectElement == 'undefined')
		 {
	
			// only fire the rest of this if the text content
			// overflows the desired dimensions
			if(this.getBBox().width > max_width) {
				
				
				// grab the text content from the text node 
				// into a variable and then zero out the 
				// initial content; we'll reinsert in a moment
				// using tspan elements.
				var text_node = d3.select(this);					
				var text_to_wrap = text_node.text();
				text_node.text('');
				
				if(text_to_wrap) {
					// split on spaces to create an array of individual words
					var text_to_wrap_array;
					if(text_to_wrap.indexOf(' ') !== -1) {
						text_to_wrap_array = text_to_wrap.split(' ');
					} else {
						// if there are no spaces, chop it in half.
						// this is a hack! better to apply
						// CSS word-break: break-word; in order
						// to handle long single-word strings that
						// might overflow. will fix to dynamically
						// compute the appropriate number of cuts later.
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
					// previous separate tspans, so to compensate we need to manually
					// track the computed text length of all previous tspans/substrings
					// and use that to offset the miscalculation to get the actual
					// position we want to use in rendering the text in the SVG.
					var offset = 0;
					// loop through the words and test the computed text length
					// of the string against the maximum width
					for(i = 0; i < text_to_wrap_array.length; i++) {
						var word = text_to_wrap_array[i];
						var previous_string = text_node.text();
						var previous_width = this.getComputedTextLength();

						var new_string;
						
						if(previous_string) {
							new_string = previous_string + ' ' + word;
						} else {
							new_string = word;
						}
						text_node.text(new_string);
						var new_width = this.getComputedTextLength();

						var test_width = new_width - offset;
						
						if(test_width > max_width) {
							if(previous_string !== '') {
								var temp = {string: previous_string, width: previous_width - offset};
								substrings.push(temp);
								offset = offset + previous_width;
								text_node.text('');
								text_node.text(word);
							}
						}
						if(i == text_to_wrap_array.length - 1) {
							var final_string = new_string.substr(previous_string.length);
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

					var substrings_clean = [];
					for(i = 0; i < substrings.length; i++) {
						if(substrings[i].string.length > 0) {
							substrings_clean.push(substrings[i]);
						}
					}
					
					var current_tspan;
					var tspan_count;
					for(i = 0; i < substrings_clean.length; i++) {
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
									return '1.5em';
								}
							})
						;
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
	}
