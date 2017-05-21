// Module dependencies.
var child_process = require('child_process');
var express = require('express');
var bodyParser = require('body-parser');
var driverNeeds = require('./driverNeeds');
var calcDistance = require('./calcDistance')
var request = require('request');
var polyline = require('polyline');
var pg = require('pg')
var port = (process.env.PORT || 3000);
var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');
var Q = require('q')
var request = require('request');

var FB_APP_ID = "1086653268053781";

var Yelp = require('yelp');
var yelp = new Yelp({
  consumer_key: "T0VjCY0WkEUOuyC5U46qMw",
  consumer_secret: "LwzcaQMBcdE2cz-iv5M3KDxHwCk",
  token: "rFX5f23ObBPeznE6DQdkyb_8Y8UNXw0q",
  token_secret: "5kBF1E8lkxcGwUATNyElljvhZBo"
});
var db = require('./db');


//starting server
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//implement this everywhere and then make sure the frontend works with it
function checkIfTokenIsValid(token){
	var deferred = Q.defer();
	db.query('SELECT token from accesstoken where token = ? ', [token],function(err,result){
		if (err){
			throw err
		}else{
				deferred.resolve(result.length !==0);
		}
	});
	return deferred.promise;
}

function addUserIfDoesntExist(userid){
	var deferred = Q.defer();
	db.query('insert into user (userid,hassurvey) values (?,0) on duplicate key update userid = ?', [userid,userid], function(err, result) {
			if (err) throw err;
			else {
				deferred.resolve(true)
			}
	});
	return deferred.promise;
}

function removeToken(token){
	
	var deferred = Q.defer();
	db.query('DELETE from accesstoken where token = ?', [token], function(err,result){
		if (err){
			throw err
		}else{
				deferred.resolve(result.length !==0)
		}
	});
	return deferred.promise;
}

app.all("/api/logout",function(req,res){
	var token = req.body.token;
	
	if(token){
		removeToken(token).then(function(){
			res.send("Deletion query ran, though didn't necessarily delete anything.")
		})
	}
	
});

app.all("/api/login",function(req,res){
	var token = req.body.token
	var userid = req.body.userid
	//if token already in DB (which shouldn't happen,)
	
    if(token && userid){
    	addUserIfDoesntExist(userid).then(function(){
			checkIfTokenIsValid(token).then(function(tokenInDBAlready){
				if(tokenInDBAlready) {
					res.send("Logged In!")
				}
				else {
					//https://graph.facebook.com/oauth/access_token_info?client_id=1086653268053781&access_token=EAAPcTi4JTxUBAB6SRrJyTwAXN0hBkWIYvBe7s4tubgAZCyD1g…wzGTolVDqzufZCVH0QUuCet2bgMN3b3dyrixKpjVVjpFZCUZD
					checkurl = "https://graph.facebook.com/oauth/access_token_info?client_id=" + FB_APP_ID+ "&access_token=" + token;
					//res.send("Logged In!")
					request.get(checkurl,function(e,r){
						if(!e && r.statusCode == 200){
							var d = new Date();
							var datestring = d.toISOString().slice(0,d.toISOString().length -1); 
							var query = "INSERT into accesstoken values(?,?,DATE_FORMAT(?, '%Y-%m-%dT%T'))";
							console.log("inserting into DB")
							db.query(query,[userid,token,datestring] ,function(e){
								if (e){
									throw e;
									res.send("dberror");
								}
								else{
									res.send("Logged In!")
								}
							});
						}
						else{
							res.send('Denied! Facebook says no.')
						}
					});	
				}
			});
		});
	}
	else {
		res.send('Denied! You need to give us a unique token and an identification number for the user.')
	}
});


function toMiles(km){
	return km * 0.621371;
}

app.get("/",function(req,res){
	res.send("Welcome to Pitstop Pal. Look at app.js to see the endpoints you want to use.");
})


//Is there a survey or not?
app.all('/api/survey/check/:userid', function(req, res){
	var token = req.body.token;
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token" )
			return;
		} else {
			db.query('SELECT hassurvey from user where userid = ?', req.params.userid, function(err, result) {
			if (err){
				throw err
			}else{
				if(!result[0]['hassurvey']){
					res.send('No survey');
				}else{
					res.send('Existing survey');
				}
			}
			});
	}
	});
});

//set survey results
//Assumption: This is only called after completing a survey.
app.all('/api/survey/set', function(req,res){ 

var token = req.body.token;
	if (token){
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token")
			return;
		}
		else {

	//by above assumption, 
	DATA_IS_FROM_SURVEY = true;
	db.query('insert into user (userid,hassurvey) values (?,1) on duplicate key update hassurvey=1', [req.body.userID], function(err, result) {
			if (err) throw err;
	});

	console.log('Start Initializing');

	for(var i = 0; i < (req.body.restaurants).length; ++i){

		var data = req.body.restaurants[i];
		var term = {
			userid: req.body.userID,
			restaurant_id: data.id,
			name: data.name,
			rate: data.rating,
			foodtype: (data.categories).toString(),
			from_survey: DATA_IS_FROM_SURVEY
		};
		driverNeeds.insert_rate(term);
		if(i== req.body.restaurants.length -1){
			res.send('Initialization Complete');
		}
	}
	console.log('Initialization Complete');
	}
});

}
else{
	res.send("invalid token")
}
});


//TO DELETE
//sets the rate for the usrs
// app.all('/api/rate/:userid/', function(req,res){
// 	token = req.body.token;
// 	checkIfTokenIsValid(token).then(function(tokenValidity){
// 		if(!token || !tokenValidity) {
// 			res.send("Invalid Token")
// 			return;
// 		}
// 		else{
// 	var term = {
// 		userid: req.params.userid,
// 		restaurant_id: req.body.id,
// 		name: req.body.name,
// 		rate: req.body.rating,
// 		foodtype: (req.body.categories).toString(),
// 		from_survey: req.body.from_survey
// 	};
// 	var dup = {
// 		rate: req.body.rate
// 	};
// 	db.query('INSERT INTO rate SET ? ON DUPLICATE KEY UPDATE rate=VALUES(rate)', term, function(err, result) { 
// 		if (err) throw err;
// 		else res.send('Data sent');
// 	});
// 	}
// });
// });

//TO DELETE
//apparently it's not used right now so frontend hasn't been updated here!!!!
//gets the rate for the users
// app.all('/api/get_rate/:userid', function (req,res) { 
// 	token = req.body.token;
// 	checkIfTokenIsValid().then(function(tokenValidity){
// 		if(!token || !tokenValidity) {
// 			res.send("Invalid Token")
// 			return;
// 		}
// 		else{
// 	var results = [];
// 	var makeQueries = function (){
// 		var deferred = Q.defer();
// 		if(! _.isUndefined(req.body.restaurants)){
// 			for(var i = 0; i < req.body.restaurants.length; i++){
// 				driverNeeds.write_file(req.params.userid, req.body.restaurants[i])
// 				.then(function(data){
// 					results.push(data);
// 					if (results.length == req.body.restaurants.length) deferred.resolve(results);
// 				});
// 			}
// 		}	
// 		else{
// 			deferred.resolve(results);
// 		}
// 		return deferred.promise;
// 	}
// 	makeQueries().then(function(results){
// 		//result will be a JSON string
// 		res.send(JSON.stringify(results));
// 	});
// 	}
// });
// });

// //insert sensor data into sensordata table
// app.all('/api/sensordata/:lat/:lon/:status/:userid', function(req,res) {
// 	token = req.body.token;
// 	checkIfTokenIsValid().then(function(tokenValidity){
// 		if(!token || !tokenValidity) {
// 			res.send("Invalid Token")
// 			return;
// 		}
// 		else{
// 	//for speed maybe
// 	var post = {userid: req.params.userid,lon:req.params.lon, lat:req.params.lat, status:req.params.status};
// 	var query = db.query('INSERT INTO sensordata SET ?', post, function(err, result) {
// 	if (err) throw err;
// 	});
// 	res.send('Data sent');
// 	}
// })
// });

//used to get pitstops for the survey
app.all('/api/search/:lat/:lon/:name/:location?', (req, res) => {
	token = req.body.token;
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token")
			return;
		}
		else{
    var lat = req.params.lat;
    var lon = req.params.lon;
    var location = req.params.location;
    var search = 'food+' + req.params.name;
    var params = {
        term: search,
    };

    if (location) {
        params.location = location;
    }
    else {
        params.ll = (lat + ',' + lon);
    }

    yelp.search(params)
    .then((data) => {
        // need further error checking, succesful request but failed response
        // getYelpBusinesses data retrieval may need to be changed
        res.send(JSON.stringify(driverNeeds.getYelpBusinesses(data, lat, lon)));
    })
    .catch((error) => {
        // 'error' is the actual error type recognized by fetch
        res.status(500).send('error');
    });
	}
})
});

// both currentPosition and lastPosition are objects with latitude and longitude
// latitude and longitude may be null
//return the restaurant within radius = 40000

//called by SwiperContainerMixin
app.all('/api/food/:currentPosition/:userid',function (req, res) {
	var token = req.body.token;
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token")
			return;
		}
		else{
	var currentPosition = JSON.parse(req.params.currentPosition);
	var radius = 40000; //max 40000 meters
	console.log("queried yelp")
	var makeQueries = function (restaurants,userid,rates){
		var deferred = Q.defer();
		var results = {};
		for(var i = 0; i < restaurants.length; i++){
			driverNeeds.write_file(userid, restaurants[i],i,rates[i])  //rate is same length as restaurants, duh
			.then(function(data){
				index = data[1];
				data = data[0];
				key = _.keys(data)[0]
				results[key] = data[key];
				if (index == (restaurants.length -1) ){
					deferred.resolve(results);
				}
			});
		}
		return deferred.promise;
	}

	yelp.search({
            term: "restaurants",
            ll: currentPosition.latitude +',' + currentPosition.longitude,
            radius_filter: radius
        },
		function(err, data){
			if (err) res.send(JSON.stringify([]));
			else {
					yelpdata = driverNeeds.getYelpBusinesses(
	                    data,
	                    currentPosition.latitude,
	                    currentPosition.longitude
	                );

					restaurants = _.map(yelpdata,function(v,key){
						return key;
					});

					rates = _.map(yelpdata,function(v,key){return v.rate});

					var userid = req.params.userid;
					makeQueries(restaurants,userid,rates).then(function(CFscores){
					//result will be a JSON string
						_.each(yelpdata, function(v,key){
							yelpdata[key]['score'] = CFscores[key].toFixed(1);
						});
						res.send(JSON.stringify(yelpdata));
					});
				}
		}
	);
	}
});
});

//TO DO: deprecate
// both currentPosition and lastPosition are objects with latitude and longitude
// latitude and longitude may be null
//return the gas station within radius = 25 miles
app.all('/api/gas/:currentPosition',function (req, res) {
	var token = req.body.token;
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token")
			return;
		}
		else{
    var currentPosition = JSON.parse(req.params.currentPosition);
	var radius = 25;//rad || 15; //miles

	driverNeeds.getStations(
        currentPosition.latitude,
        currentPosition.longitude,
        radius,
        res
    );
	}
});	
});


// both currentPosition and lastPosition are objects with latitude and longitude
// latitude and longitude may be null
//return the gas station within radius = 25 miles
app.all('/api/gas/:currentPosition/:sortBy',function (req, res) {
	var token = req.body.token;
	checkIfTokenIsValid(token).then(function(tokenValidity){
		if(!token || !tokenValidity) {
			res.send("Invalid Token")
			return;
		}
		else{
    var currentPosition = JSON.parse(req.params.currentPosition);
    var sortBy = req.params,sortBy;
	var radius = 25;//rad || 15; //miles

	driverNeeds.getStations(
        currentPosition.latitude,
        currentPosition.longitude,
        radius,
        res,
        sortBy
    );
	}
});	
});

console.log('App running on port: ' + port);

app.listen(port);
