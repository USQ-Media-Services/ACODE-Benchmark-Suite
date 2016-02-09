var mongodb = require('mongodb'),

/*Database connection (once it `loads` the APIS will go live)*/
	dbPort = process.env.mongo_port,
	dbHost = process.env.mongo_host,
	dbUser = process.env.mongo_user,
	dbPass = process.env.mongo_pass,
	dbDatabase = process.env.mongo_database || 'acode_benchmarks',
	db = false,
	serv,
	getDB = function getDB () {
		return db
	}

	getDB.callback = function () {}

	serv = new mongodb.Server(dbHost, dbPort, {
	    'auto_reconnect': true,
	    'poolSize': 30
	})
	dbManager = new mongodb.Db(dbDatabase, serv, {safe: true})
	.open(function (error, DB) {
		if (!error) DB.authenticate(dbUser, dbPass, function (err, res) {
			db = DB
			console.log(err || 'DB Connected');
			getDB.callback(err, db)
		})
		else {
			console.log(error);
		}

	});


module.exports = getDB
