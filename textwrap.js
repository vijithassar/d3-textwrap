function wrap_text(d, i) {

		// if we have foreign objects available, insert with a div
		if(typeof SVGForeignObjectElement !== 'undefined')
		 {
			var field_group = d3.select(this.parentNode);
			var text_node = field_group.selectAll('text');
			var field_text = text_node.text();
			text_node.remove();
			var foreign_object = field_group.append('foreignObject');
			foreign_object
			    .attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
				.attr('x', child_x_position)
				.attr('y', child_y_position)
 				.attr('width', child_width)
 				.attr('height', child_height)
			;
			var wrap_div = foreign_object
				.append('xhtml:div')
				.attr('class', 'wrapped')
			;			
			wrap_div
 				.attr('height', child_height)
 				.attr('width', child_width)
 				.attr('style', 'padding:' + label_padding + 'px;')
				.html(field_text)
			;
		}
				
		// if we can't just insert foreign objects, 
		// jump through hoops to separate into tspans
		if(typeof SVGForeignObjectElement == 'undefined')
		 {

			var max_width = child_width;

			if(this.getBBox().width > max_width) {

				var text_node = d3.select(this);					
				text_node.text('');

				var text_to_wrap = d.name;
				if(text_to_wrap) {
					var text_to_wrap_clean = key_to_string(text_to_wrap);
					var text_to_wrap_array;
					if(text_to_wrap_clean.indexOf(' ') !== -1) {
						text_to_wrap_array = text_to_wrap_clean.split(' ');
					} else {
						var string_length = text_to_wrap_clean.length;
						var midpoint = parseInt(string_length / 2);
						var first_half = text_to_wrap_clean.substr(0, midpoint);
						var second_half = text_to_wrap_clean.substr(midpoint, string_length);
						text_to_wrap_array = [first_half, second_half];
					}
					
					var substrings = [];
					var offset = 0;
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
