var math = require('math');
var moment = require('moment');
var calcDistance = require('./calcDistance');


function calcBearing(lat1, long1, lat2, long2) {
  var y = math.sin(lat2-lat1) * math.cos(long2);
  var x = math.cos(long1)*math.sin(long2) -
        math.sin(long1)*math.cos(long2)*math.cos(lat2-lat1);
  var bearing = math.atan2(y, x).toDegrees();
  return bearing;
}

//list should be 2d array that contains restaurantID, lat, long in
//each element. time1 and time2 will be timestamps formated per sql syntax
//Range is in km and lookAheadTime is in minutes
var directionFilter = function(list, lat1, long1, time1, lat2, long2, time2, range,
    lookAheadTime){
      var distance = calcDistance(lat1, long1, lat2, long2);
      var time1Moment = moment(time1);
      var time2Moment = moment(time2);
      var secDiff = time2Moment.diff(time1Moment, 'seconds');
      var secondsInLookAhead = 60*5;
      var speed = distance/secDiff;
      var travelDistInLookAhead = speed * secondsInLookAhead;
      var diffLat = lat2 - lat1;
      var diffLong = long2 - long1;
      var diffTo5MinRatio = secondsInLookAhead / secDiff;
      var futureDiffLat = diffTo5MinRatio * diffLat;
      var futureDiffLong = diffTo5MinRatio * diffLong;
      var futureLat = futureDiffLat + lat2;
      var futureLong = futureDiffLong + long2;
      var listLength = list.length;
      var results = [];
      var trackSlopeRatioPerp = -diffLat/diffLong;
      var trackSlopeRatio = diffLong/diffLat;
      console.log("Origin Lat: " + futureLat);
      console.log("Origin Long: " + futureLong);
      for (var i = 0; i < listLength; i++) {
        var restLong = list[i][2];
        var restLat = list[i][1];
        var restID = list[i][0];

        var restToFutureOriginDist = calcDistance(restLat, restLong, futureLat,
          futureLong);
        var restToCurrentPosDist = calcDistance(restLat, restLong, lat2, long2);

        if (restToFutureOriginDist <= range) {
        	if (restToFutureOriginDist <= restToCurrentPosDist) {
            console.log("track slope: " + trackSlopeRatioPerp);
            console.log("rest slope: " + restSlopeRatio);
            if (trackSlopeRatioPerp == Infinity || trackSlopeRatioPerp == -Infinity) {
              if (futureLat > lat2 && futureLong == long2) {
                if (restLat >= futureLat) {
                  console.log("first: " + restID);
                  results.push(restID);
                }
                else {
                  console.log("restID: " + restID);
                }
              }
              else if (futureLat <= lat2 && futureLong == long2) {
                if (restLat <= futureLat) {
                  console.log("second: " + restID);
                  results.push(restID);
                }
              }
              /*
              else if (futureLong > long2 && futureLat == lat2) {
                if (restLong >= futureLong) {
                  console.log("third: " + restID);
                  results.push(restID);
                }
              }
              else if (futureLong <= long2 && futureLat == lat2) {
                if (restLong <= futureLong) {
                  console.log("fourth: " + restID);
                  results.push(restID);
                }
              }
              */
              else {
                console.log("Infinity didn't catch");
              }
            }
            else if (trackSlopeRatioPerp < 0 && restSlopeRatio > trackSlopeRatioPerp) {
                console.log("fifth: " + restID);
		            results.push(restID);
		        }
            else if (trackSlopeRatioPerp > 0 && restSlopeRatio < trackSlopeRatioPerp) {
                console.log("sixth: " + restID);
                results.push(restID);
            }
            else {
              console.log("yolo");
            }
        	}
        }
  }
  return results;
}

module.exports.directionFilter = directionFilter;
