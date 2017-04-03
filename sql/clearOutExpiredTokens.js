var mysql = require("mysql");
var _ = require("underscore")

var db_hostname = "";
var user_name = "";
var socket_path = "";
var database_name = "";
var extra_mysql_options = {}
var con = null;
var Q = require( "q" ); // v2.11.1


if (_.isUndefined(process.env.CLEARDB_DATABASE_URL) ){//  local
	db_hostname= "localhost";
	user_name = "root";
	database_name = "eecs498";
	extra_mysql_options['socketPath'] = "/tmp/mysql.sock"; // use mysqladmin variables | grep sock to get the socket path

	var con_config_object = {
	host     : db_hostname,
	user     : user_name,
	database: database_name
	};

	con_config_object = _.extend(con_config_object, extra_mysql_options) //sometimes we have a password, sometimes not

	con = mysql.createConnection(con_config_object);
}
else { //on heroku server - FIX THIS  
	// This is the url  -- mysql://b7b3e582520bf3:8c4db96b@us-cdbr-iron-east-04.cleardb.net/heroku_5dc52f2194d539a?reconnect=true'
	//^CLEARDB_DATABASE_URL
	// I obtained ^ by running heroku config -- also available on the UI of the website
	// parts of url -- mysql://user:pass@hostname/DB?reconnect=true
	

  pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL);
} 

var db = {
    query: function( sql, params ) {

        var deferred = Q.defer();

        pool.query( sql, params, deferred.makeNodeResolver());

        return( deferred.promise );

    }
};

var promise = db
            .query(
				'DELETE FROM accesstoken WHERE tokenExpirationDate < now()'
            )
.then(
function handleSettled( data ) {
        pool.end();

});




