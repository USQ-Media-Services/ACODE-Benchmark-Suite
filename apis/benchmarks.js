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
			res.status(500).json()
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
				res.status(500).json('Could not request the data')
			}
			else {
				res.status(404).json("No benchmark data found")
			}
		})
	}
	else {
		res.status(412).json('Missing parameter')
	}
})

r.post('/save', function (req, res, next) {
	if (!!req.body && !!req.body.data && !!req.body.data.institution) {
		var data = req.body.data,
			ID = ObjectId(req.body.data.institution),
			year = (new Date()).getFullYear()

		delete data._id
		req.body.data.institution = ObjectId(req.body.data.institution)
		var newData = {}
		newData['users.' + data.user + '.benchmarks.' + data.benchmarkID] = data.benchmarkData
		db().collection('profiles').update({'year': year, institution: ID}, {$set: newData}, {new: true, doc:true}, function (err, doc) {
			if (err) {
				console.log(err)
				res.status(500).json('Contains malformed data; please removed any copy-pasted images and re insert them with the editor')
			}
			else res.status(200).json('OK')
		})
	}
	else {
		res.status(412).json('Missing parameter')
	}
})

r.get('/export', function (req, res, next) {
	if (!!req.query.year && !!req.query.benchmark) {
		db().collection('institutions').find({}).toArray(function (err, institutions) {
			db().collection('profiles').find({'year': parseInt(req.query.year, 0)}).toArray(function (err, profiles) {
				db().collection('meta_benchmarks').find({}).toArray(function (err, benchmarks) {
					if (err) {
						console.log(err)
						res.status(500).json('Malformed data')
					}
					else {

						var benchmarksKeyed = {},
							institutionsKeyed = {},
							profilesKeyed = {},
							col1 = [],
							counter = 0

						for (var i in benchmarks) {
							benchmarksKeyed[benchmarks[i]._id] = benchmarks[i]
						}

						for (var i in institutions) {
							institutionsKeyed[institutions[i]._id] = institutions[i]
						}

						for (var i in profiles) {
							profilesKeyed[profiles[i].institution] = profiles[i]
						}

						for (var i in institutionsKeyed) {
							counter++
							var newData = {}
							if (!req.query.anonymised || req.query.anonymised === i) newData.Institution = institutionsKeyed[i].title
							else newData.Institution = 'Insititution ' + counter

							for (var k in benchmarksKeyed[req.query.benchmark].questions) {
								if (profilesKeyed[i] && profilesKeyed[i].benchmarks && profilesKeyed[i].benchmarks[req.query.benchmark] && profilesKeyed[i].benchmarks[req.query.benchmark][k])  {
									newData['PI ' + benchmarksKeyed[req.query.benchmark].title.replace('Benchmark ', '') +'.' + (parseInt(k, 0) + 1)] = profilesKeyed[i].benchmarks[req.query.benchmark][k].overall || '-'
								}
								else {
									newData['PI ' + benchmarksKeyed[req.query.benchmark].title.replace('Benchmark ', '') +'.' + (parseInt(k, 0) + 1)] = '-'
								}

							}
							col1.push(newData)
						}

						res.csv(col1, benchmarksKeyed[req.query.benchmark].title + ".csv")
					}

				})
			})
		})
	}
	else {
		res.status(412).json('Missing parameter')
	}
})


module.exports = r
