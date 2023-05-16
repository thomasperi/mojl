const assetTagAttr = require('./assetTagAttr.js');

async function styleTag(settings, currentPage, options) {
	let file = ( options && Object.hasOwnProperty.call(options, 'file') ) ?
		options.file : settings.buildCssFile;
	let href = await assetTagAttr(settings, currentPage, file, options);
	return `<link rel="stylesheet" href="${href}" />`;
}

module.exports = styleTag;