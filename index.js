var express = require('express'),
	db = require('./libs/db-connector.js'),
	app = express(),
	sugar = require('sugar'),
	port = process.env.PORT || 6871,
	realSever = (process.env.PORT ? 'https://usq-workwear-form.herokuapp.com/' : 'http://localhost:' + port + '/'),
	serverBaseUrl = 'https://acode-benchmark-tool.herokuapp.com/',
	pleeease = require('pleeease'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    noop = function () {},
    del = require('del'),
    compressor = require('node-minify'),
    getCSS = function (loc, req, res, next) {
    	var loc = decodeURIComponent(loc.replace('/concatStyles/', 'public/').replace(/---/g, '---public/')),
			file = new Buffer(loc).toString('base64').substr(0, 128),
			fileArray =	loc.split('---'),
			tempData = ''

    	fs.exists(`tmp/${file}`, function (exists) {
	    	if (!exists) mkdirp('tmp', function () {
				for (var i in fileArray) {
					if (
						fileArray[i].indexOf('.map') === -1 &&
						fileArray[i].indexOf('http:') === -1 &&
						fileArray[i].indexOf('https:') === -1 &&
						fileArray[i].indexOf('file:') === -1 &&
						fileArray[i].indexOf('://') === -1 &&
						fileArray[i].indexOf('..') === -1 &&
						fileArray[i].indexOf('./') === -1
					){
						var t = fs.readFileSync(`${fileArray[i]}`).toString('utf8'),
							p = path.parse(fileArray[i])

						tempData = tempData + t.replace(/\.\.\//g, `${p.dir.replace('public/', '../')}/../`).toString('utf8')
					}
				}
				pleeease.process(tempData, {}).then(function (result) {
					fs.writeFile(`tmp/${file}`, require('zlib').gzipSync(result), function () {
						res.setHeader('Content-Type', 'text/css')
						res.setHeader('Content-Encoding', 'gzip')
						res.sendFile(`${process.cwd()}/tmp/${file}`)							
					})
				}).catch(function (result) {
					console.log(result.toString())
				})
	    	})
	    	else {
				res.setHeader('Content-Type', 'text/css')
				res.setHeader('Content-Encoding', 'gzip')
	    		res.sendFile(`${process.cwd()}/tmp/${file}`)
	    	}
    	})
    },
    getJS = function (loc, req, res, next) {
    	var loc = decodeURIComponent(loc.replace('/concatScripts/', 'public/').replace(/---/g, '---public/')),
			file = new Buffer(loc).toString('base64').substr(0, 128),
			fileArray =	loc.split('---')

		for (var i in fileArray) {
			if (fileArray[i].indexOf('.map') > -1) fileArray.splice(i, 1)
			else if (fileArray[i].indexOf('http:') > -1) fileArray.splice(i, 1)
			else if (fileArray[i].indexOf('https:') > -1) fileArray.splice(i, 1)
			else if (fileArray[i].indexOf('..') > -1) fileArray.splice(i, 1)
		}

		fs.exists(`tmp/${file}`, function (exists) {
	    	if (!exists) mkdirp('tmp', function () {
				new compressor.minify({
					type: 'no-compress',
					fileIn: fileArray,
					fileOut: `tmp/${file}`,
					callback: function(err, min) {
						fs.writeFile(`tmp/${file}`, require('zlib').gzipSync(fs.readFileSync(`tmp/${file}`)), function () {
							res.setHeader('Content-Type', 'application/javascript')
							res.setHeader('Content-Encoding', 'gzip')
							res.sendFile(`${process.cwd()}/tmp/${file}`)							
						})
					}
				})
	    	})
	    	else {
				res.setHeader('Content-Type', 'application/javascript')
				res.setHeader('Content-Encoding', 'gzip')
	    		res.sendFile(`${process.cwd()}/tmp/${file}`)
	    	}
    	})
    }


del.sync('tmp', {force:true})

app.use(require('cors')())
app.use(require('compression')())
app.use(require('cache-control')({}))

app.use('/concatScripts', function (req, res, next) {
	getJS(req.originalUrl, req, res, next)
})

app.use('/concatStyles', function (req, res, next) {
	getCSS(req.originalUrl, req, res, next)
})


app.use(express.static(`${process.cwd()}/tmp`))

app.use(express.static(`${process.cwd()}/public`))



db.callback = function (err) {
	app.listen(port);
}



 