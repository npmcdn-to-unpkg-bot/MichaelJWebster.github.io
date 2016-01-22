define(["jquery", "d3", "underscore"], function($, d3, _) {
    var mu = {};

    /**
     * Shuffle the data d into a new copy of d randomly shuffled.
     *
     * @param d      An arra or other type of collection to be shuffled.
     *
     * @returns A version of d that has been shuffled using underscore's
     *          implementation.
     */
    mu.shuffleData = function(d) {
	return _.shuffle(d);
    };
    
    return mu;
});
