const assetTagAttr = require('./assetTagAttr.js');

async function scriptTag(settings, currentPage, collationNames, options) {
	let srcs = await assetTagAttr(settings, currentPage, 'js', collationNames, options);
	return srcs.map(src => `<script src="${src}"></script>`).join(''); 
}

module.exports = scriptTag;