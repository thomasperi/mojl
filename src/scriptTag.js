const assetTagAttr = require('./assetTagAttr.js');

async function scriptTag(settings, currentPage, options) {
	let file = ( options && Object.hasOwnProperty.call(options, 'file') ) ?
		options.file : settings.buildJsFile;
	let src = await assetTagAttr(settings, currentPage, file, options);
	return `<script src="${src}"></script>`;
}

module.exports = scriptTag;