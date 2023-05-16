const fs = require('fs');

module.exports.reset = () => {
	module.exports.ttl = 24 * 60 * 60 * 1000;
	module.exports.cache = {};
};

module.exports.freshen = (file) => {
	let cache = module.exports.cache;
	let modTime = fs.existsSync(file) && fs.statSync(file).ctimeMs;

	Object.keys(cache).forEach(f => {
		if (Date.now() > cache[f].expires) {
			delete cache[f];
		}
	});

	if (!cache[file] || cache[file].modTime !== modTime) {
		cache[file] = {
			modTime,
			expires: Date.now() + module.exports.ttl
		};
		return true;
	}
	return false;
};

module.exports.reset();