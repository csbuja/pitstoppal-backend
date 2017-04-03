var db = require('../db');

db.query('DELETE FROM accesstoken WHERE tokenExpirationDate < now()', function(err, result) {
	if (err){
		console.log(err)
	}
	else {
		console.log('done');
		db.end();
	}
});