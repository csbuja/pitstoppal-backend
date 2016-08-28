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



function toMiles(km){
	return km * 0.621371;
}



app.all('/api/check/survey/:userid', function(req, res){
	db.query('SELECT userid from user where userid = ?', req.params.userid, function(err, result) {
		if (err){
			throw err
		}else{
			if(result.length == 0){
				res.send('No survey');
			}else{
				res.send('Existing survey');
			}
		}
	});
});


app.all('/api/survey', function(req,res){
	console.log('Start Initializing');
	var post = {userid: req.body.userID};
	db.query('INSERT INTO user SET ?', post, function(err, result) {
		if (err) throw err;
		else console.log('Registered');
	});

	for(var i = 0; i < (req.body.restaurants).length; ++i){

		var data = req.body.restaurants[i];
		var term = {
			userid: req.body.userID,
			restaurant_id: data.id,
			name: data.name,
			rate: data.rating,
			foodtype: (data.categories).toString()
		};
		driverNeeds.check_add(term);
	}
	console.log('Initialization Complete');
});
app.all('/api/rerate/:userid', function(req, res){

	db.query('select * from rate where userid = ?', req.params.userid, function(err, survey){
		if (err) throw err;
		else{
			res.send({"method1" :driverNeeds.rate_cosine(req.body.businesses, survey),
			"method2":driverNeeds.rate_sim(req.body.businesses, survey),
			"method3":driverNeeds.rate_weigh(req.body.businesses, survey) });
		}
	});
});

app.all('/api/rate/:userid/', function(req,res){
	var term = {
		userid: req.params.userid,
		restaurant_id: req.body.id,
		name: req.body.name,
		rate: req.body.rating,
		foodtype: (req.body.categories).toString()
	};
	var dup = {
		rate: req.body.rate
	};
	db.query('INSERT INTO rate SET ? ON DUPLICATE KEY UPDATE rate=VALUES(rate)', term, function(err, result) {
		if (err) throw err;
		else res.send('Data sent');
	});

});

app.all('/api/get_rate/:userid', function (req,res) { //TODO - spencer and jing
	var results = [];
	var makeQueries = function (){
		var deferred = Q.defer();
		for(var i = 0; i < req.body.restaurants.length; i++){
			driverNeeds.write_file(req.params.userid, req.body.restaurants[i])
			.then(function(data){
				results.push(data);
				if (results.length == req.body.restaurants.length) deferred.resolve(results);
			});
		}
		return deferred.promise;
	}
	makeQueries().then(function(results){
		//result will be a JSON string
		res.send(JSON.stringify(results));


	});

});

app.all('/api/test/', function(req,res){
	var b = req.body.id;
	var tmp = [];
	for(var i = 0; i < b.length; ++i){
		yelp.business(b[i],function(err, data){
			if (err){
				res.send("not");
			}else{
				var info = [];
				for(var j = 0; j < data.categories.length; j++){
					info.push(data.categories[j][1]);
				}
				console.log("\'" + data.id.toString()+"\':\'" + info.toString() + "\',");
			}
		});
	}


});

//insert sensor data into sensordata table
app.all('/api/sensordata/:lat/:lon/:status/:userid', function(req,res) {
	//for speed maybe
	var post = {userid: req.params.userid,lon:req.params.lon, lat:req.params.lat, status:req.params.status};
	var query = db.query('INSERT INTO sensordata SET ?', post, function(err, result) {
	if (err) throw err;
	});
	res.send('Data sent');
});


app.get('/api/search/:lat/:lon/:name/:location?', (req, res) => {
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
});

// both currentPosition and lastPosition are objects with latitude and longitude
// latitude and longitude may be null
//return the restaurant within radius = 40000
app.get('/api/yelp/:currentPosition/:lastPosition/:userid',function (req, res) {
	var currentPosition = JSON.parse(req.params.currentPosition);
	var radius = 40000; //max 40000 meters

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
});

// both currentPosition and lastPosition are objects with latitude and longitude
// latitude and longitude may be null
//return the gas station within radius = 25 miles
app.get('/api/gas/:currentPosition/:lastPosition',function (req, res) {
    var currentPosition = JSON.parse(req.params.currentPosition);
	var radius = 25;//rad || 15; //miles

	driverNeeds.getStations(
        currentPosition.latitude,
        currentPosition.longitude,
        radius,
        res
    );
});

console.log('App running on port: ' + port);

app.listen(port);
