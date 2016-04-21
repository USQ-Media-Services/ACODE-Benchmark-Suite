var r = require('express').Router(),
	ObjectId = require('mongodb').ObjectId,
	db = require('../libs/db-connector.js')

r.get('/all', function (req, res) {
	db().collection('snapshots').find({hidden: {$ne: true}}).toArray(function (err, snapshots) {
		if (!err && snapshots) {
			res.json(snapshots)
		}
		else if (!!err) {
			res.sendStatus(500)
		}
	})
})

r.get('/single', function (req, res) {
	if (req.query.id && req.query.id.length === 24) {
		var _id = ObjectId(req.query.id)
		db().collection('snapshots').find({_id: _id}).toArray(function (err, profile) {
			if (!err && profile[0]) {
				res.json(profile[0])
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

r.get('/meta', function (req, res) {
	db().collection('meta_snapshots').find({}).sort({required: -1, _id:1}).toArray(function (err, metaSnapshots) {
		res.json(metaSnapshots)
	})
})

r.post('/save', function (req, res) {
	if (!!req.body && !!req.body.data && !!req.body.data.institution) {
		var data = req.body.data
		delete data._id
		req.body.data.institution = ObjectId(req.body.data.institution)
		db().collection('snapshots').update({'year': (new Date()).getFullYear(), institution: req.body.data.institution}, {$set: data}, {upsert: true, new: true, doc:true}, function (err, doc) {
			db().collection('snapshots').update({'year': (new Date()).getFullYear() - 1, institution: req.body.data.institution}, {$set: {hidden: true}})
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
