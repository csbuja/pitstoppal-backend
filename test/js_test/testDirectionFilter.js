var filter = require('../../directionFilter');
var assert = require("assert");

//direction of travel is purely north
var pastLat = 42.234188;
var pastLong = -83.732124;
var curLat = 42.279594;
var curLong = -83.732124;
var time1 = "2016-10-23 13:21:20";
var time2 = "2016-10-23 13:26:20";
var range = 5;
var lookAheadTime = 5;
var correctResults = [11111, 22222, 66666, 77777, 88888];

var resturantList = [[11111, 42.33, -83.732124], [22222, 42.33, -83.74],
                     [33333, 42.6, -83.732124], [44444, 42.279594, -83.8],
                     [55555, 42.279594, -83.752124], [66666, 42.325,-83.762124],
                     [77777, 42.325,-83.762124], [88888, 42.325,-83.762124]];

var results = filter.directionFilter(resturantList, pastLat, pastLong, time1,
  curLat, curLong, time2, range, lookAheadTime);
/*
for (var i = 0; i < results.length; i++) {
  console.log(results[i]);
}
*/

for (var i = 0; i < results.length; i++) {
  if (results[i] != correctResults[i]) {
    console.log("Fail");
    return;
  }
}
console.log("Pass");
