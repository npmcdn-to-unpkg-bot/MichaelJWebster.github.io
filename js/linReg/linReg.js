if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports, module) {
/*
 * linRegression
 * https://github.com/michaelw/LinearRegression
 *
 * Copyright (c) 2016 Michael Webster
 * Licensed under the MIT license.
 */
//define(function(require, exports, module) {
    var MdArray = require('../util/MdArray');
    var _ = require("underscore");

    'use strict';

    /**
     * @classdesc Perform Linear regression on a data set. 
     *
     * Construct an initialized linReg object from X and Y. X is an n column
     * MdArray with m rows - where m is the number of examples in the dataset,
     * and n is the number of features. Y is an m X 1 MdArray the value of the
     * dependent variable corresponding to each of the m rows of X.
     *
     * Normalise X according to the normalisation method requested, and then
     * prepend a column of 1's to it.
     *
     * Initialise theta to be an MdArray of n rows by 1 column all set to 0.
     *
     * @param X       An MdArray of independent feature values, with 1 row for
     *                each example in the traning set.
     * @param Y       An MdArray of values of the dependent variable, with 1
     *                value for each example in the training set.
     * @param normalisation
     *                The type of normalisation to use on the features.
     * @param alpha   The learning rate.
     * @param lambda  The regularisation parameter.
     *
     * @returns An initialise linReg object ready to perform linear regression.
     * @constructor
     */
    var linReg = function(X, Y, normalisation, alpha, lambda) {
	'use strict';
	assert(X instanceof MdArray,
	       "linReg: X must be an instance of MdArray.");
	assert(Y instanceof MdArray,
	       "linReg: Y must be an instance of MdArray.");

	this.norm = normalisation || "NONE";
	this.alpha = alpha || 0.5;
	this.lambda = lambda || 0.0;

	this.XOrg = X.copy();
	this.Y = Y;

	this.normaliseVal = function(x) { return x;};
	this.X = (this.norm == "NONE") ? X : this.normalise(X, this.norm);
	this.X = this.X.addOnes();
	// Number of examples is the number of rows in X
	this.m = this.X.dims[0];
	// Number of features is the number of columns in X.
	this.nFeatures = this.X.dims[1];
	this.theta = MdArray.ones({shape: [this.nFeatures, 1]});
	return this;
    };
    
    linReg.prototype = {
	constructor: linReg,

	runRegression: function(numIters, recordCosts) {
	    var rc = recordCosts || false;
	    var costs = null;
	    if (rc) {
		costs = [];
	    }
	    for (var i = 0; i < numIters; i++) {
		this.updateHyp();
		if (rc) {
		    costs.push(costFn(this.X, this.Y, this.theta));
		}
	    }
	    return costs;
	},

	updateHyp: function() {
	    var grad = regLinGrad(this.X, this.Y, this.theta, this.alpha, this.lambda);
	    this.theta = this.theta.sub(grad);
	},

	/**
	 * For each row in X, return the prediction resulting from dotting it with
	 * theta.
	 *
	 * @param X      An MdArray containing the same number of columns as theta has
	 *               rows, and containing 1 row for each example we're getting a
	 *               prediction for.
	 * @param theta  A theta array with the same number of rows as X has columns.
	 *
	 * @returns The value of X.theta.
	 */
	predict: function (X) {
	    var Xnormalised = this.normaliseVal(X).addOnes();
	    return Xnormalised.dot(this.theta);
	},

	/**
	 * Linear regression cost function.
	 *
	 * @param X        The array of features for each example.
	 * @param Y        The observed values for our target variable.
	 * @param theta    The current value for theta.
	 *
	 * @returns  The cost for the given theta.
	 */
	costFn: function(X, Y) {
	    // The number of examples is the number of rows in our X or Y vectors.
	    var numExamples = X.dims[0];
	    var hypothesis = this.predict(X);
	    var diff_vector = hypothesis.sub(Y);
	    var cost_val = ((diff_vector.pow(2)).sum())/ (2 * numExamples);
	    return cost_val;
	},

	/**
	 * Normalise the columns of data in X according to the requested normType
	 * normalisation method.
	 *
	 * @param X     An mxn MdArray where each of the n columns contains
	 *              feature values to be normalised.
	 * @param       normType - should be either MINMAX or STD.
	 *
	 * @returns A copy of X with the columns normalised according to the
	 *          requested normalisation method.
	 */
	normalise: function normalise(X, normType) {
	    if (normType === 'MINMAX') {
		return this.normaliseMinMax(X);
	    }
	    else {
		return this.normaliseStd(X);
	    }
	},

	/**
	 * Return a new Md array containing:
	 *
	 * (xi - mu(col)) / (max(col) - min(col))
	 *
	 * for each Xi in each column.
	 * 
	 * @param X    An MdArray containing some columns of data to be normalised.
	 *
	 * @returns A new MdArray with normalised values from X.
	 */
	normaliseMinMax: function normaliseMinMax(X) {
	    var maxX = X.max(1);
	    var minX = X.min(1);
	    var mu = X.mean(1);
	    this.normaliseVal = function() {
		return function(Xval) {
		    return Xval.sub(mu).div(maxX.sub(minX));
		};
	    }();
	    return X.sub(mu).div(maxX.sub(minX));
	},

	/**
	 * Return an MdArray containing (xi - mu(col))/(sigma(col)) for each
	 * xi and each column.
	 *
	 * @param X  An MdArray containing m feature values for n training set
	 *           examples.
	 *
	 * @returns The MdArray with normalised columns.
	 */
	normaliseStd: function normaliseStd(X) {
	    var mu = X.mean(1);
	    var sigma = X.std(1);
	    this.normaliseVal = function() {
		return function(Xval) {
		    return Xval.sub(mu).div(sigma);
		};
	    }();	    
	    return X.sub(mu).div(sigma);
	}
    	
	
    };

    /**
     * Return the gradient of the cost function with respect to theta.
     *
     * @param X       The training "dependent" variables data set.
     * @param Y       The training "independent" variable data set.
     * @param theta   The current value of theta.
     * @param alpha   The learning rate.
     * @param lambda  The regularization parameter.
     *
     * @returns The gradient term for changing theta to move it towards a
     *          minimum for the cost function.
     */
     function regLinGrad(X, Y, theta, alpha, lambda) {
	 var m = X.dims[0];

	 // Get the current hypothesis
	 var currentHyp = getPrediction(X, theta);

	 // Get an MdArray of the differences between currentHyp and Y.
	 var diff = currentHyp.sub(Y);

	 // Multiply the difference by X.
	 var diffByX = diff.mul(X);

	 var grad = MdArray.zeros({shape: theta.dims});
	 var firstTerm = (alpha/m) * diffByX.newSlice([":", "0"]).sum();
	 grad.set(firstTerm, 0, 0);

	 var remaining = diffByX.newSlice([":", "1:"]);
	 var mainSum = remaining.sum(1).T();
	 var lambdaTheta = theta.mul(lambda).newSlice(["1:", ":"]);
	 mainSum = (mainSum.add(lambdaTheta)).mul(alpha/m);
	 grad.slice(["1:", "0"]).assign(mainSum);
	 return grad;
     }

    /**
     * Linear regression cost function.
     *
     * @param X        The array of features for each example.
     * @param Y        The observed values for our target variable.
     * @param theta    The current value for theta.
     *
     * @returns  The cost for the given theta.
     */
    function costFn(X, Y, theta) {
	// The number of examples is the number of rows in our X or Y vectors.
	var numExamples = X.dims[0];
	var hypothesis = getPrediction(X, theta);
	var diff_vector = hypothesis.sub(Y);
	var cost_val = ((diff_vector.pow(2)).sum())/ (2 * numExamples);
	return cost_val;
    }

    function getPrediction(X, theta) {
	return X.dot(theta);
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

    module.exports = linReg;

});

