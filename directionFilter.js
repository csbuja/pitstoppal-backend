var math = require('math');
var moment = require('moment');
var calcDistance = require('./calcDistance');


function toDegrees (angle) {
  var preAngle = angle * (180 / Math.PI);
  if (preAngle < 0) {
    preAngle = preAngle + 360;
  }
  else if (preAngle > 360) {
    preAngle = preAngle - 360;
  }
  return preAngle;
}

function calcBearing(lat1, long1, lat2, long2) {
  var Δψ = math.log(math.tan(math.PI/4+lat2/2)/math.tan(math.PI/4+lat1/2));
  var Δλ = long2-long1;

  // if dLon over 180° take shorter rhumb line across the anti-meridian:
  if (math.abs(Δλ) > math.PI) Δλ = Δλ>0 ? -(2*math.PI-Δλ) : (2*math.PI+Δλ);

  var brng = toDegrees(math.atan2(Δλ, Δψ));
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
      console.log("Current Lat: " + lat2);
      console.log("Current Long: " + long2);
      console.log("Origin Lat: " + futureLat);
      console.log("Origin Long: " + futureLong);
      var bearingToFuture = calcBearing(lat2, long2, futureLat, futureLong);
      var bearingToPast = 0;
      if (bearingToFuture > 180) {
        bearingToPast = bearingToFuture - 180;
      }
      else {
        bearingToPast = bearingToFuture + 180;
      }
      console.log("Bearing to Future: " + bearingToFuture);
      console.log("Bearing to Past: " + bearingToPast);
      var bearingOne = bearingToFuture - 90;
      var bearingTwo = bearingToFuture + 90;
      if (bearingTwo > 360) {
        bearingTwo = bearingTwo - 360;
      }
      if (bearingOne < 0) {
        bearingOne = bearingOne + 360;
      }

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
            //console.log("rest slope: " + restSlopeRatio);
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
        	}
        }
  }
  return results;
}

module.exports.directionFilter = directionFilter;
