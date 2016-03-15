var mongodb = require('mongodb'),
	mongodbUri = require('mongodb-uri'),

/*Database connection (once it `loads` the APIS will go live)*/
	uri = (process.env.MONGOLAB_URI ? mongodbUri.parse(process.env.MONGOLAB_URI) : {hosts:[{}]}),

/*Database connection (once it `loads` the APIS will go live)*/
	dbPort = uri.hosts[0].port || process.env.mongo_port,
	dbHost = uri.hosts[0].host || process.env.mongo_host,
	dbUser = uri.username || process.env.mongo_user,
	dbPass = uri.password || process.env.mongo_pass,
	dbDatabase = uri.database ||'acode_benchmarks',
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
