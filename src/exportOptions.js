const path = require('path').posix;

function exportOptions(expandedOptions) {
	const exportObj = JSON.parse(JSON.stringify(expandedOptions));

	delete exportObj.base;

	Object.keys(exportObj).forEach(key => {
		if (key.startsWith('_')) {
			delete exportObj[key];
		}
	});

	const _mojlVersion = require(path.join(__dirname, '../package.json')).version;

	return JSON.stringify({_mojlVersion, ...exportObj});
}

module.exports = exportOptions;