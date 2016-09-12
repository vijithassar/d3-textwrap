import { selection, select } from 'd3-selection';

var method,
    verify_bounds,
    resolve_bounds,
    resolve_padding,
    pad,
    dimensions,
    wrap,
    textwrap;

// test for foreignObject support and determine wrapping strategy
method = typeof SVGForeignObjectElement === 'undefined' ? 'tspans' : 'foreignobject';

// accept multiple input types as boundaries
verify_bounds = function(bounds) {
    var bounds_object,
        bounds_function;
    bounds_function = typeof bounds === 'function';
    if (typeof bounds === 'object' && ! bounds.nodeType) {
        if (! bounds.height || ! bounds.width) {
            console.error('text wrapping bounds must specify height and width');
            return false;
        } else {
            return true;
        }
    }
    // convert a selection to bounds
    if (
        bounds instanceof selection ||
        bounds.nodeType ||
        bounds_function ||
        bounds_object
    ) {
        return true;
    // use input as bounds directly
    } else {
        console.error('invalid bounds specified for text wrapping');
        return false;
    }
};

resolve_bounds = function(bounds) {
    var properties,
        dimensions,
        result,
        i;
    properties = ['height', 'width'];
    if (typeof bounds === 'function') {
        dimensions = bounds();
    } else if (bounds.nodeType) {
        dimensions = bounds.getBoundingClientRect();
    } else if (typeof bounds === 'object') {
        dimensions = bounds;
    }
    result = Object.create(null);
    for (i = 0; i < properties.length; i++) {
        result[properties[i]] = dimensions[properties[i]];
    }
    return result;
};

resolve_padding = function(padding) {
    var result;
    if (typeof padding === 'function') {
        result = padding();
    } else if (typeof padding === 'number') {
        result = padding;
    } else if (typeof padding === 'undefined') {
        result = 0;
    }
    if (typeof result !== 'number') {
        console.error('padding could not be converted into a number');
    } else {
        return result;
    }
};

pad = function(dimensions, padding) {
    var padded;
    padded = {
        height: dimensions.height - padding * 2,
        width: dimensions.width - padding * 2
    };
    return padded;
};

dimensions = function(bounds, padding) {
    var padded;
    padded = pad(resolve_bounds(bounds), resolve_padding(padding));
    return padded;
};


wrap = {};

// wrap text using foreignobject html
wrap.foreignobject = function(text, dimensions, padding) {
    var content,
        parent,
        foreignobject,
        div;
    // extract our desired content from the single text element
    content = text.text();
    // remove the text node and replace with a foreign object
    parent = select(text.node().parentNode);
    text.remove();
    foreignobject = parent.append('foreignObject');
    // add foreign object and set dimensions, position, etc
    foreignobject
        .attr('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);
    if (typeof padding === 'number') {
        foreignobject
            .attr('x', padding)
            .attr('y', padding);
    }
    // insert an HTML div
    div = foreignobject
        .append('xhtml:div');
    // set div to same dimensions as foreign object
    div
        .style('height', dimensions.height)
        .style('width', dimensions.width)
        // insert text content
        .html(content);
    return div;
};

// wrap text using tspans
wrap.tspans = function(text, dimensions, padding) {
    var pieces,
        piece,
        line_width,
        x_offset,
        tspan,
        previous_content;
    pieces = text.text().split(' ').reverse();
    text.text('');
    tspan = text.append('tspan');
    tspan
        .attr('dx', 0)
        .attr('dy', 0);
    x_offset = 0;
    while (pieces.length > 0) {
        piece = pieces.pop();
        tspan.text(tspan.text() + ' ' + piece);
        line_width = tspan.node().getComputedTextLength() || 0;
        if (line_width > dimensions.width) {
            previous_content = tspan.text()
                .split(' ')
                .slice(0, -1)
                .join(' ');
            tspan.text(previous_content);
            x_offset = tspan.node().getComputedTextLength() * -1;
            tspan = text.append('tspan');
            tspan
                .attr('dx', x_offset)
                .attr('dy', '1em')
                .text(piece);
        }
    }
    if (typeof padding === 'number') {
        text
            .attr('y', text.attr('y') + padding)
            .attr('x', text.attr('x') + padding);
    }
};

// factory to generate text wrap functions
textwrap = function() {
    // text wrap function instance
    var wrapper,
        bounds,
        padding;
    wrapper = function(targets) {
        targets.each(function() {
            select(this).call(wrap[method], dimensions(bounds, padding), resolve_padding(padding));
        });
    };
    // get or set wrapping boundaries
    wrapper.bounds = function(new_bounds) {
        if (new_bounds) {
            if (verify_bounds(new_bounds)) {
                bounds = new_bounds;
                return wrapper;
            } else {
                console.error('invalid text wrapping bounds');
                return false;
            }
        } else {
            return bounds;
        }
    };
    // get or set padding applied on top of boundaries
    wrapper.padding = function(new_padding) {
        if (new_padding) {
            if (typeof new_padding === 'number' || typeof new_padding === 'function') {
                padding = new_padding;
                return wrapper;
            } else {
                console.error('text wrap padding value must be either a number or a function');
                return false;
            }
        } else {
            return padding;
        }
    };
    // get or set wrapping method
    wrapper.method = function(new_method) {
        if (new_method) {
            method = new_method;
            return wrapper;
        } else {
            return method;
        }
    };
    return wrapper;
};

export default textwrap;
