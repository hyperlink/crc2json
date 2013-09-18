const MAP_SEP    = '/'
var dive         = require('dive')
var crc32        = require('buffer-crc32')
var fs           = require('graceful-fs')
var path         = require('path')
var when         = require('when')
var EventEmitter = require('events').EventEmitter
var normalizeSep = path.sep != MAP_SEP
var normalRegExp = /\\/g

module.exports = function crc2json(pathname, cb, pretty) {
	var map      = Object.create(null)
	var promises = []
	var event    = false

	if (cb instanceof EventEmitter) {
		event = cb
	}

	dive(pathname, {all: true}, function(err, file) {
		if (err) {
			return console.error(err)
		}
		var deferred = when.defer()
		promises.push(deferred.promise)
		fs.readFile(file, addBufferToMap.bind({e: event, map: map, filename: file, pathname: pathname, deferred: deferred}))
	}, function(){
		when.all(promises).then(complete)
	})

	function complete() {
		if (event) {
			event.emit('complete')
		} else {
			cb.call(this, map)
		}
	}
}

function addBufferToMap(err, buffer) {
	if (err) {
		this.deferred.reject(err)
		return console.error(err)
	}

	var key = this.filename.replace(this.pathname + path.sep, '')
	try {
		var crc = crc32.unsigned(buffer)
	} catch(e) {
		console.error(e, this.filename, buffer)
		this.deferred.reject(e)
	}

	if (this.e) {
		this.e.emit('crc', normal(key), crc)
	} else {
		// console.log(key, crc)
		this.map[normal(key)] = crc
	}

	this.deferred.resolve(this.filename)
}


function normal(filepath) {
	if (normalizeSep) {
		return filepath.replace(normalRegExp, MAP_SEP)
	}
	return filepath
}