var db = require('../db');

db.query('DELETE FROM accesstoken WHERE tokenExpirationDate < now()', function(err, result) {
	console.log('done');
});