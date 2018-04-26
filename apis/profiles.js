var r = require('express').Router(),
	ObjectId = require('mongodb').ObjectId,
	db = require('../libs/db-connector.js')

r.get('/all', function (req, res) {
	var t = {hidden: {$ne: true}}
	if (req.query.year) t.year: req.query.year
	db().collection('profiles').find(t).toArray(function (err, profiles) {
		if (!err && profiles) {
			res.json(profiles)
		}
		else if (!!err) {
			res.status(500).json('')
		}
	})
})

r.get('/all-from-institution', function (req, res) {
	if (req.query.id && req.query.id.length === 24) {
		var _id = ObjectId(req.query.id)

		var t = {institution: _id}
		if (req.query.year) t.year: req.query.year

		db().collection('profiles').find(t).toArray(function (err, profiles) {
			if (!err && profiles.length > 0) {
				res.json(profiles)
			}
			else if (!!err) {
				console.log(err)
				res.status(500).json('')
			}
			else {
				res.status(404).json('No institution profile found')
			}
		})
	}
	else {
		res.status(412).json('Missing parameter')
	}
})

r.get('/single', function (req, res) {
	if (req.query.id && req.query.id.length === 24) {
		var _id = ObjectId(req.query.id)

		var t = {_id: _id}
		if (req.query.year) t.year: req.query.year

		db().collection('profiles').find(t).toArray(function (err, profile) {
			if (!err && profile[0]) {
				res.json(profile[0])
			}
			else if (!!err) {
				console.log(err)
				res.status(500).json('Contains malformed data; please removed any copy-pasted images and re insert them with the editor')
			}
			else {
				res.status(404).json('Profile not found')
			}
		})
	}
	else {
		res.status(412).json('Missing parameter')
	}
})

r.get('/meta', function (req, res) {
	db().collection('meta_profiles').find({}).sort({required: -1, _id:1}).toArray(function (err, metaProfiles) {
		res.json(metaProfiles)
	})
})

r.post('/save', function (req, res) {

	if (!!req.body && !!req.body.data && !!req.body.data.institution) {
		var data = req.body.data
		delete data._id
		req.body.data.institution = ObjectId(req.body.data.institution)
		db().collection('profiles').update({'year': (new Date()).getFullYear(), institution: req.body.data.institution}, {$set: data}, {upsert: true, new: true, doc:true}, function (err, doc) {
			db().collection('profiles').update({'year': (new Date()).getFullYear() - 1, institution: req.body.data.institution}, {$set: {hidden: true}})
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




module.exports = r
