module.exports = function calcDistance(lat1,lon1,lat2,lon2){
var R = 6371; // km
var pi = 3.141592653589793238462643383279502884;
var φ1 = lat1*(pi/180);
var φ2 = lat2*(pi/180)
var Δφ = (lat2-lat1)*(pi/180);
var Δλ = (lon2-lon1)* (pi/180);

var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

var d = R * c;
return d.toFixed(2);
}
