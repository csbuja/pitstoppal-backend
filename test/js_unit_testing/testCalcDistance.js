var calcDistance = require('../calcDistance');
var assert = require("assert");

describe('calcDistance()', function(){
    it('should return a number greater than or equal to 0', function(){
    	assert(calcDistance(45.492367,-73, 44, -72.0) > 0)
  })
})

