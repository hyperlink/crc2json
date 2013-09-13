const MAP_SEP    = '/'
var dive         = require('dive')
var crc32        = require('buffer-crc32')
var fs           = require('graceful-fs')
var path         = require('path')
var when         = require('when')
var normalizeSep = path.sep != MAP_SEP
var normalRegExp = /\\/g


module.exports = function crc2json(pathname, cb, pretty) {
	var map      = Object.create(null)
	var promises = []
	dive(pathname, function(err, file) {
		if (err) {
			return console.error(err)
		}
		var deferred = when.defer()
		promises.push(deferred.promise)
		fs.readFile(file, addBufferToMap.bind({filename: file, deferred: deferred}))
	}, function(){
		when.all(promises).then(complete)
	})

	function addBufferToMap(err, buffer) {
		if (err) {
			this.deferred.reject(err)
			return console.error(err)
		}

		var key = this.filename.replace(pathname + path.sep, '')
		try {
			var crc = crc32.unsigned(buffer)
		} catch(e) {
			console.error(e, this.filename, buffer)
		}
		// console.log(key, crc)
		map[normal(key)] = crc
		this.deferred.resolve(this.filename)
	}

	function complete() {
		cb.call(this, map)
	}

	function normal(filepath) {
		if (normalizeSep) {
			return filepath.replace(normalRegExp, MAP_SEP)
		}
		return filepath
	}
}