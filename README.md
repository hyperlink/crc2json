# crc2json #

Scan a directory of files and generates a CRC32 for each file and outputs them in JSON format.


## CLI install and usage ##

    npm install -g crc2json

To scan the current directory and write to `list.json` 

    crc2json -o list.json

Get help for other flags

    crc2json -h


## As a node module ##

    npm install crc2json --save

Example:

```javascript

var crc2json = require('crc2json')

crc2json(process.cwd(), function(map){
	console.log(map)
})
```

## License MIT ##