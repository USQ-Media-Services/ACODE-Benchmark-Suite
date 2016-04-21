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

r.get('/meta', function (req, res) {
	db().collection('meta_benchmarks').find({}).sort({required: -1, _id:1}).toArray(function (err, metaProfiles) {
		res.json(metaProfiles)
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

r.post('/save', function (req, res, next) {
	if (!!req.body && !!req.body.data && !!req.body.data.institution) {
		var data = req.body.data
		delete data._id
		req.body.data.institution = ObjectId(req.body.data.institution)
		var newData = {}
		newData['users.' + data.user + '.benchmarks.' + data.benchmarkID] = data.benchmarkData
		db().collection('profiles').update({'year': (new Date()).getFullYear(), institution: req.body.data.institution}, {$set: newData}, {new: true, doc:true}, function (err, doc) {
			if (err) {
				console.log(err)
				res.sendStatus(500)
			}
			else res.sendStatus(200)
		})
	}
	else {
		res.sendStatus(412)
	}
})


module.exports = r
