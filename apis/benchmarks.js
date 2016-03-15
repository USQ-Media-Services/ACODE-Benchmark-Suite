var r = require('express').Router(),
	ObjectId = require('mongodb').ObjectId,
	db = require('../libs/db-connector.js')

r.get('/all', function (req, res) {
	db().collection('benchmarks').find({}).toArray(function (err, benchmarks) {
		if (!err && benchmarks) {
			res.json(benchmarks)
		}
		else if (!!err) {
			console.log(err)
			res.sendStatus(500)
		}
	})
})

r.get('/single', function (req, res) {
	if (req.query.id && req.query.id.length === 24) {
		var _id = ObjectId(req.query.id)
		db().collection('benchmarks').find({_id: _id}).toArray(function (err, benchmark) {
			if (!err && benchmark[0]) {
				res.json(benchmark[0])
			}
			else if (!!err) {
				console.log(err)
				res.sendStatus(500)
			}
			else {
				res.sendStatus(404)
			}
		})
	}
	else {
		res.sendStatus(412)
	}
})




module.exports = r
