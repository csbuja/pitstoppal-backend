var mysql = require("mysql");

//spencer - /tmp/mysql.sock', // use mysqladmin variables | grep sock to get the socket path
// server  '/var/run/mysqld/mysqld.sock', // use mysqladmin variables | grep sock to get the socket path
	// First you need to create a connection to the db
var con = mysql.createConnection({
	host     : 'localhost',
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
