const path = require('path').posix;
const createDevLoader = require('./createDevLoader.js');

const devLoaders = {};
['css', 'js'].forEach(async type => {
	devLoaders[type] = createDevLoader(
		path.join(__dirname, 'devLoaderTemplate.' + type)
	);
});

module.exports = devLoaders;
