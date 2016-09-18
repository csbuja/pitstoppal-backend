var filter = require('../../directionFilter');
var assert = require("assert");

//direction of travel is purely northeast, aka 45 degrees
var pastLat = 42.234188;
var pastLong = -83.732124;
var curLat = 42.2659669;
var curLong = -83.6891706;
var time1 = "2016-10-23 13:21:20";
var time2 = "2016-10-23 13:26:20";
var range = 5;
var lookAheadTime = 5;
var correctResults = [];

/*
Bearings:
1. 180 degrees from future origin
2. 90 degrees from future origin
3. 269.99 degrees from future origin
4. 319.99 degrees from future origin
5. 100.01 degrees from future origin
6. 150.01 degrees from future origin
7. 120.01 degrees from future origin
8. 75 degrees from future origin
9. Perpindicular line is 67.5 to 247.5 (counter clockwise)
*/
var resturantList = [[11111, 42.2707738, -83.6462172], [22222, 42.29774, -83.6097516],
                     [33333, 42.29774, -83.6826828], [44444, 42.3184052, -83.6696645],
                     [55555, 42.2930566, -83.6103083], [66666, 42.2743859, -83.6279912],
                     [77777, 42.2842554, -83.6146438], [88888, 42.3047213, -83.6109902]];

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
