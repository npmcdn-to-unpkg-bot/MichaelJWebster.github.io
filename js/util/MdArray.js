define(function(require, exports, module) {
/*
 * MdArray
 * https://github.com/michaelw/MdArray
 *
 * A multi-dimensional array implementation for use in machine learning and
 * other calculations.
 *
 * Copyright (c) 2016 Michael Webster
 * Licensed under the MIT license.
 */
/*
 * FIXME: Need to add scalar multiplication/division, add etc.
 *
 */
var _ = require("underscore");

'use strict';

/**
 * @classdesc The MdArray class provides a multi-dimensional array like
 * abstraction for javascript.
 *
 * Construct an Ml_ndarray object from it's shape in terms of rows,columns,
 * and any other dimensions it has.
 *
 * The parameter to the constructor is a javascript object containing keyword
 * arguments. Eg.:
 *
 * {
 *        data: [1, 2, 3, 4],
 *        shape: [2, 2]
 * }
 *
 * @param arrayArgs    An object containing the keyword args for the constructor.
 * @constructor
 */
var MdArray = function(arrayArgs) {
    'use strict';
    assert(arrayArgs.data,
	   "MdArray constructor must be called with an object having at " +
	   "least one of the shape or data fields.");
    this.data = arrayArgs.data;
    this.dSize = this.data.length;

    var dims;
    var tSize;
    var strides;
    if (arrayArgs.shape) {
	dims = arrayArgs.shape;
	tSize = _.reduce(dims, function(memo, val) {
            return memo * val;
	}, 1);
	strides = getStrides(dims);
    }
    else {
	dims = [arrayArgs.data.length];
	tSize = arrayArgs.data.length;
	strides = [1];
    }
    this.dims = dims;
    this.tSize = tSize;
    this.strides = strides;
 
    assert(this.tSize == this.dSize,
	   "Data must by the right size for the supplied dimenstions.");

    // Return this for chaining?
    return this;
};

MdArray.prototype = {
    constructor: MdArray,
    
    /**
     * Get the value of the element indexed by the coordinate values in the
     * arguments.
     *
     * @returns The value at the array position specified.
     * @method
     */ 
    get: function() {
	'use strict';
	var args = _.toArray(arguments);
        var idx = this.findIndex(args);
        return this.data[idx];
    },

    /**
     * Set the value in the array element indexed by the remaining values in
     * arguments.
     *
     * @param val   The value to be assigned into the array.
     *
     * @method
     */
    set: function(val) {
	'use strict';
        var idx = this.findIndex(_.rest(arguments));
        this.data[idx] = val;
    },

    /**
     * Return the required 1-d javascript array index indicated by the supplied
     * index coordinates.
     *
     * @param idx  An array containing the coordinate of the requested element.
     *
     * @method
     */
    findIndex: function(idx) {
	'use strict';
	assert(idx.length == this.strides.length,
	       "Wrong number of arguments to index array with " + this.strides.length
	       + " dimensions.");
        var md_idx = _.zip(idx, this.strides);	
	return _.reduce(md_idx, function(memo, val) {
	    return memo + val[0] * val[1];
	}, 0);
    
    },

    /**
     * Return a string representation of the the multi-Dimensional array.
     *
     * @returns A readable string for the array.
     *
     * @method
     */
    toString: function() {
	var idxInfo = _.zip(this.dims.slice(0), this.strides.slice(0));
	function ts(dimStrides, idx, data) {
	    s = "[";
	    if (dimStrides.length == 1)
	    {
		s += "\t";
		var first = dimStrides[0];
		for (var i = 0; i < first[0]; i++) {
		    s += " " + data[idx + i * first[1]];
		}
		s += "   ]";
	    }
	    else {
		var first = _.first(dimStrides);
		for (var i = 0; i < first[0]; i++) {
		    s += ts(_.rest(dimStrides), idx + i * first[1], data);
		    if (i < first[0] - 1) {
			s += "\n";
		    }
		}
		s += "]";
	    }
	    if (dimStrides.length == idxInfo.length) {
		s += "\n";
	    }
	    return s;
	}
	return ts(idxInfo, 0, this.data);
    },

    /**
     * Return the data of this MdArray as a flat array.
     *
     * @method
     */
    flatten: function() {
	return this.data;
    },

    /**
     * Apply the function opFn to all pairs of matching elements in this and that.
     *
     * @param that   The other object that is part of this operation.
     * @param opFn   The operation to be applied to pairs of elements from this
     *               and that.
     *
     * @returns      A new MdArray containing the results of applying opFn to
     *               this and that.
     *
     * @method
     */
    applyOp: function(that, opFn) {
	var newData = null;
	if (that instanceof MdArray) {
	    var compatible = this.compatible(that);
	    if (compatible)
	    {
		newData = _.map(this.data, function(val, idx) {
		    return opFn(val, that.data[idx]);
		});
	    }
	    else {
		throw new Error("MdArray.applyOp: Incompatible sizes for arrays.");
	    
	    }
	}
	else { // multiply by scalar.
	    newData = _.map(this.data, function(val) { return opFn(val, that); });
	}
	var newArray = new MdArray({data: newData, shape : this.dims.slice(0)});
	return newArray;
    },

    /**
     * Test whether the MdArray that is compatible with this one, so that
     * element wise operations are able to be applied between this and that.
     *
     * @param that    An MdArray object to have it's dimensions checked against
     *                this.
     *
     * @returns true => this and that are compatible, false otherwise.
     *
     * @method
     */
    compatible: function(that) {
	var dims = _.zip(this.dims, that.dims);
	return _.every(dims, function(x) { return x[0] === x[1]; });
    },

    /**
     * Add that to this, and return a new array containing the result.
     *
     * @param that   The array to be added to this one.
     *
     * @returns A new MdArray containing the values of that + this.
     *
     * @method
     */
    add: function(that) {
	return this.applyOp(that, function(x, y) { return x+y; });
    },

    /**
     * Subtract that from this, and return a new MdArray containing the result.
     *
     * @param that   The array to be subtracted from this one.
     *
     * @returns A new MdArray containing the values of this - that.
     *
     * @method
     */
    sub: function(that) {
	return this.applyOp(that, function(x, y) { return x-y; });
    },

    /**
     * Multiply this by that and return a new MdArray containing the result.
     *
     * @param that   The array to be multiplied with this one.
     *
     * @returns A new MdArray containing the values of this * that.
     *
     * @method
     */    
    mul: function(that) {
	return this.applyOp(that, function(x, y) { return x*y; });
    },

    /**
     * Divide this by that and return a new MdArray containing the result.
     *
     * @param that   The array to divide this by.
     *
     * @returns A new MdArray containing the values of this / that.
     *
     * @method
     */    
    div: function(that) {
	if (that instanceof MdArray)
	{
	    if (_.some(that.data, function(x) { return x == 0; }))
	    {
		throw new Error("MdArray.div: divisor contains a zero.");
	    }
	}
	else {
	    if (that == 0) {
		throw new Error("MdArray.div: Attempt to divide by zero.");
	    }
	}
	return this.applyOp(that, function(x, y) { return x/y; });
    },

    /**
     * Return the dot product of this and that.
     *
     * Note: This method only runs for 1 or 2 dimensional MdArrays.
     *
     * @param that    An MdArray to be dotted with this one.
     *
     * @returns A value if this and that are 1-dimensional arrays, or a m x p
     *          size MdArray where m is the number of rows in this, and p is the
     *          number of columns in that.
     */
    dot: function(that) {
	assert(this.dims.length <= 2,
	       "dot is only defined for 1 or 2 dimensional MdArrays.");
	assert(this.dims.length === that.dims.length,
	       "dot is only defined between MdArray's with the same number of dimensions.");
	if (this.dims.length === 1) {
	    assert(this.dSize === that.dSize,
		   "dot is only defined for 1 dimensional MdArray's of the same size.");
	    return _.reduce(_.zip(this.data, that.data), function(memo, val) {
		return memo + val[0] * val[1];
	    }, 0);
	}
	else {
	    var dotProd = MdArray.zeros({shape: [this.dims[0], that.dims[1]]});
	    for (var i = 0; i < this.dims[0]; i++) {
		for (var j = 0; j < that.dims[1]; j++) {
		    var rowData = this.slice([i.toString(), ":"]).flatten();
		    var colData = that.slice([":", j.toString()]).flatten();
		    var val = _.reduce(_.zip(rowData, colData), function(memo, v) {
			return memo + v[0] * v[1];
		    }, 0);
		    dotProd.set(val, i, j);
		}
	    }
	    return dotProd;
	}
    },

    /**
     * Return a new array containing the transpose of this array or, if inPlace
     * is true, modify this array to be Transposed.
     *
     * @param args    An optional object containing a boolean valued key inPlace.
     *
     * @returns A new array, or this.
     *
     * @method
     */
    T: function(args /* inPlace == true/false => default false*/) {
	var inPlace = (args && args.inPlace) || false;
	if (inPlace) {
	    this.strides = this.strides.reverse();
	    return this;
	}
	else {
	    var transposed =
		    new MdArray(
			{data : this.data.slice(0), shape: this.dims.slice(0)}
		    );
	    transposed.strides.reverse();
	    return transposed;
	}
    },

    /**
     * Apply function f to each element of the MdArray.
     *
     * @param f   A function that can be applied to elements of this.
     *
     * @method
     */
    foreach: function(f) {
	var indices = enumerateDims(this.dims);
	for (var i = 0; i < indices.length; i++) {
	    f(this.data[this.findIndex(indices[i])]);
	}
    },

    /**
     * Create and return an ArrayView object representing a slice of this
     * array.
     *
     * The sliceInfo parameter is an array of strings that follow the python
     * numpy array slice syntax. So for example:
     *
     * - "2:5" would be taken to mean take just all the values between 2 and 5,
     * - ":" would mean take all possible values for this dimension.
     * - ":5" would mean take all values up to 5,
     * and so on.
     *
     * @param sliceInfo   An array containing strings of sliceInfo.
     *
     * @return A new ArrayView object appropriately created for the slice.
     *
     * @method
     */
    slice: function(sliceInfo) {
	return new ArrayView
	(
	    this.data,
	    this.dims.slice(0),
	    this.strides.slice(0),
	    sliceInfo
	);
    },

    /**
     * Add a column of ones as the first column in the MdArray.
     *
     * NOTE: This only works for 2 dimensional arrays.
     *
     * @returns A new MdArray with the 0'th column being all 1s.
     *
     * @method
     */
    addOnes: function() {
	assert(this.dims.length == 2,
	       "addOnes only defined for 2 dimensional arrays.");
	var dims = this.dims;
	var stride = this.strides[0] + 1;
	var newData = this.data.slice(0);
	var rows = _.range(0, dims[0]);

	_.each(rows, function(val) {
	    newData.splice(val * stride, 0, 1.0);
	});
	return new MdArray({data: newData, shape: [dims[0], dims[1] + 1]});
    }    
	
};

/*
 * Factory functions.
 *
 * Includes:
 * - arange Create an MdArray containing a range of numbers.
 * - zeros Create an MdArray containing 0s.
 * - ones  Create an MdArray containing 1s.
 */
/**
 * Return an MdArray of zeros. Args are the shape of the array.
 *
 * @param args    An object containing a shape field with an array of
 *                dimensions.
 *
 * @returns An MdArray of the requested shape containing all zeros.
 */
MdArray.zeros = function(args /* args.shape = [d1, d2, ...dn] */) {
    'use strict';
    args.fill = 0;
    return MdArray.createFilled(args);
};

/**
 * Return an MdArray of ones. Args are the shape of the array.
 *
 * @param args    An object containing a shape field with an array of
 *                dimensions.
 *
 * @returns An MdArray of the requested shape containing all ones.
 */
MdArray.ones = function(args /* args.shape = [d1, d2, ...dn] */) {
    'use strict';
    args.fill = 1;
    return MdArray.createFilled(args);
};

/**
 * Return an MdArray of containing the requested fill value.
 *
 * @param args    An object containing a shape field with an array of
 *                dimensions, and a fill field.
 *
 * @returns An MdArray of the requested shape containing the repeated fill value.
 */
MdArray.createFilled = function(args/* args.shape = [d1, d2, ...dn], args.val = n */)
{
    'use strict';
    var fillVal = args.fill || 0;
    var ma = Object.create(MdArray.prototype);
    var tSize = _.reduce(args.shape, function(memo, val) {
	return memo * val;
    }, 1);
    var data = new Array(tSize);
    for (var i = 0; i < tSize; i++) {
	data[i] = fillVal;
    }
    ma.data = data;
    ma.tSize = tSize;
    ma.dSize = ma.data.length;
    ma.dims = args.shape;
    ma.strides = getStrides(ma.dims);
    return ma;
};

/**
 * Create an MdArray containing a range of numeric values.
 *
 * @param args    An object containing a shape field with an array of dimensions,
 *                an end field, and an optional start and by field.
 *
 * @return An MdArray containing the requested range of values.
 */
MdArray.arange = function(args /* [start,] end [, by] [, shape] */) {
    'use strict';
    var start = args.start || 0;
    var end = args.end;
    var by = args.by || 1;
    var rangeVal = _.range(start, end, by);
    var shapeVal = args.shape || [rangeVal.length];
    return new MdArray({data : rangeVal, shape : shapeVal});
};

/**
 * Given the dimensions of an MdArray, return an array of strides for the
 * array.
 *
 * @param dims     An array of dimensions for the MdArray.
 *
 * @returns An array containing the strides for the MdArray.
 */
function getStrides(dims) {
    'use strict';
    if (dims.length == 1) {
	return [1];
    }
    var reversed = dims.slice(0).reverse();
    var strides = [];
    _.each(reversed, function(val, idx, arr) {
	if (idx == 0) {
	    strides.unshift(1);
	    strides.unshift(val);
	}
	else if (idx != arr.length - 1) {
	    strides.unshift(val * strides[0]);
	}
    });
    return strides;
}

/**
 * @constructor
 * @augments MdArray
 * Construct an ArrayView object 
 */
function ArrayView(orgData, orgDims, orgStrides, sliceInfo) {
    this.data = orgData;
    this.dims = orgDims;
    this.strides = orgStrides;
    this.slices = processSlices(orgDims, sliceInfo);
    return this;
}

ArrayView.prototype = Object.create(MdArray.prototype);

_.extend (ArrayView.prototype, {
    // Constructor
    constructor: ArrayView,
    /**
     * Return the required 1-d javascript array index indicated by the supplied
     * index coordinates.
     *
     * @param idx  An array containing the coordinate of the requested element.
     * @method
     */
    findIndex: function(idx) {
	'use strict';
	var myThis = this;
	assert(idx.length == this.strides.length,
	       "Wrong number of arguments to index array with " + this.strides.length
	       + " dimensions.");
        var md_idx = _.zip(idx, this.slices, this.strides);
	assert(_.every(md_idx, function(val, idx) {
	    return (val[0] + val[1].start) < myThis.dims[idx];
	 }), "ArrayView: Index out of range.");
	
	return _.reduce(md_idx, function(memo, val) {
	    return memo + (val[0] + val[1].start) * val[2];
	}, 0);
    },
    
    /**
     * Return a string representation of the the multi-Dimensional array.
     *
     * @returns A readable string for the array.
     * @method
     */
    toString: function() {
	var idxInfo = _.zip(this.slices.slice(0), this.strides.slice(0));
	function ts(ss, idx, data) {
	    s = "[";
	    if (ss.length == 1)
	    {
		s += "\t";
		
		var firstDim = ss[0];
		for (var i = firstDim[0].start; i < firstDim[0].end; i++) {
		    s += " " + data[idx + i * firstDim[1]];
		}
		s += "   ]";
	    }
	    else {
		var firstDim = _.first(ss);
		for (var i = firstDim[0].start; i < firstDim[0].end; i++) {
		    s += ts(_.rest(ss), idx + i * firstDim[1], data);
		    if (i < firstDim[0].end - 1) {
			s += "\n";
		    }
		}
		s += "]";
	    }
	    if (ss.length == idxInfo.length) {
		s += "\n";
	    }
	    return s;
	}
	return ts(idxInfo, 0, this.data);
    },

    /**
     * Return a new array containing the data of the view.
     */
    flatten: function() {
	var flattened = [];
	this.foreach(function(x) {flattened.push(x); });
	return flattened;
    },

    foreach: function(f) {
	var indices = enumerateSlices(this.slices);
	for (var i = 0; i < indices.length; i++) {
	    f(this.data[this.findIndex(indices[i])]);
	}
    },
    enumerateIndices: function() {
	return enumerateSlices(this.slices);
    },
    setSlice : function(vals) {
	var sliceIndices = this.enumerateIndices();
	for (var i = 0; i < vals.length; i++) {
	    this.set.apply(this, [vals[i]].concat(sliceIndices.shift()));
	}
	return;
    }
});

/**
 * Return an array of objects with start and end index values calculated
 * from the values in dims and sliceInfo.
 *
 * @param dims      An array containing the dimensions of the original MdArray.
 * @param sliceInfo An array of slice strings.
 *
 * @returns An array of objects, each of which has a start and end indicating
 *          the start and end of a slice for a particular dimension.
 */
function processSlices(dims, sliceInfo) {
    assert(dims.length === sliceInfo.length,
	   "ArrayView: dims and sliceInfo parameters must be of the same length.");
    var ds = _.zip(dims, sliceInfo);
    var processedSlices = _.map(ds, function(val) {
	var dim = val[0];
	var si = val[1].replace(/\s/g, "");
	var siSplits = si.split(":");
	var splitObj = {};
	if (siSplits.length === 1) {
	    // Just an index
	    splitObj.start = parseInt(siSplits[0]);
	    splitObj.end = Math.min(splitObj.start + 1, dim);
	}
	else {
	    splitObj.start = (siSplits[0].length > 0) ?
		parseInt(siSplits[0]) : 0;
	    splitObj.end = (siSplits[1].length > 0) ?
		parseInt(siSplits[1]) : dim;
	}
	assert(splitObj.start >= 0 && splitObj.start < splitObj.end,
	       "ArrayView: First slice index must be > 0 and < the second index.");
	assert(splitObj.end <= dim,
	       "ArrayView: Second slice index must be less than dim");
	return splitObj;
    });
    return processedSlices;
}

/**
 * Return a list of all coordinates for the given MdArray.
 *
 * @param dims  An array of dimensions for an MdArray.
 *
 * @returns An ordered list containing a coordinate for every element of the
 *          MdArray.
 */
function enumerateDims(dims) {

    if (dims.length == 0) {
	return [];
    }
    var firstRange = _.map(_.range(_.first(dims)), function(val) {
	return [val];
    });
    if (dims.length == 1) {
	return firstRange;
    }
    else {
	var restDims = enumerateDims(_.rest(dims));
	var final = [];
	_.each(firstRange, function(val) {
	    var final1 = _.map(restDims, function(rVal) {
		return val.slice(0).concat(rVal.slice(0));
	    });
	    final = final.concat(final1);
	});
	return final;
    }
}

/**
 * Return a list of all coordinates for the given MdArray.
 *
 * @param dims  An array of dimensions for an MdArray.
 *
 * @returns An ordered list containing a coordinate for every element of the
 *          MdArray.
 */
function enumerateSlices(slices) {

    if (slices.length == 0) {
	return [];
    }
    var firstSlice = _.first(slices);
    var firstRange =
	    _.map(_.range(firstSlice.start, firstSlice.end), function(val) {
		return [val - firstSlice.start];
	    });
    if (slices.length == 1) {
	return firstRange;
    }
    else {
	var restSlices = enumerateSlices(_.rest(slices));
	var final = [];
	_.each(firstRange, function(val) {
	    var final1 = _.map(restSlices, function(rVal) {
		return val.slice(0).concat(rVal.slice(0));
	    });
	    final = final.concat(final1);
	});
	return final;
    }
}


/**
 * Raise an error if possible, when there is a violation of the expectations
 * of the ml-ndarray module.
 */
function assert(condition, message) {
    'use strict';
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message;
    }
}


module.exports = exports = MdArray;

});
