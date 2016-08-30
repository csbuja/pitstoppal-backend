var mysql = require("mysql");
var _ = require("underscore")

//spencer - /tmp/mysql.sock', // use mysqladmin variables | grep sock to get the socket path
// server  '/var/run/mysqld/mysqld.sock', // use mysqladmin variables | grep sock to get the socket path
	// First you need to create a connection to thes db
var db_url = ""
if (_.isUndefined(process.env.CLEARDB_DATABASE_URL) ){// not on heroku server {
	db_url = "localhost";
}
else { //on heroku server
	db_url=process.env.CLEARDB_DATABASE_URL;
} 

	var con = mysql.createConnection({
		host     : db_url,
		user     : 'root',
		socketPath  : '/tmp/mysql.sock', // use mysqladmin variables | grep sock to get the socket path
		database: 'eecs498',

	});


	con.connect(function(err){
		if(err){
					console.log('Error connecting to Db');
					console.log(err)
					return;
		};
			
		console.log('Connection established');
	});


module.exports = con;
