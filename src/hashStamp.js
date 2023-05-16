const fs = require("fs");
const crypto = require('crypto');
const ctimeCache = require('./ctimeCache.js');

// The hash is in base64, so replace the base64 characters
// that are reserved for URIs with characters that aren't.
// Seems nicer than url-encoding them, and since they never need
// to be decoded, they don't need to be standard base64 values.
const pattern = /[+=/]/g;
const map = {
	'+': '*',
	'=': '~',
	'/': '!'
};

const stampCache = {};
const has = Object.prototype.hasOwnProperty;

async function hashStamp(path) {
	// Remove cached stamps for files that are no longer in the ctime cache.
	Object.keys(stampCache).forEach(f => {
		if (!has.call(ctimeCache.cache, f)) {
			delete stampCache[f];
		}
	});

	if (!stampCache[path] || ctimeCache.freshen(path)) {
		stampCache[path] = await generateStamp(path);
	}
	return stampCache[path];
}

async function generateStamp(path) {
	let hash;
	if (fs.existsSync(path) && fs.statSync(path).isFile()) {
		let content = await fs.promises.readFile(path, 'binary');
		let sha = crypto.createHash('sha1');
		sha.update(content);
		hash = sha.digest('base64').replace(pattern, m => map[m]);
	} else {
		hash = 'not-found';
	}
	return '?h=' + hash;
}

module.exports = hashStamp;
