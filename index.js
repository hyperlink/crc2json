#!/usr/bin/env node
var pjson    = require('./package.json')
var path     = require('path')
var Command  = require('commander').Command
var fs       = require('graceful-fs')
var program  = new Command(pjson.name)
var crc2json = require('./crc2json.js'), cwd

program
	.version(pjson.version)
	.option("-o, --output <file>", 'saves json to <file>')
	.option("-p, --pretty", 'output as pretty print json')
	.option("-d, --directory <dir>", "scan <dir> or current directory if omitted")
	.parse(process.argv)

if (program.directory) {
	cwd = path.resolve(program.directory)
} else {
	cwd = process.cwd()
}

crc2json(cwd, complete)

function complete(map) {
	var content
	if (program.pretty) {
		content = JSON.stringify(map, null, '\t')
	} else {
		content = JSON.stringify(map)
	}

	if (program.output) {
		var resolvedOutputFile = path.resolve(program.output)
		fs.writeFile(resolvedOutputFile, content, function(err) {
			if (err) throw err
			console.log("Written to %s", resolvedOutputFile)
		})
	} else {
		console.log(content)
	}
}
