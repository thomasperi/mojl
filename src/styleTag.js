const assetTagAttr = require('./assetTagAttr.js');

async function styleTag(settings, currentPage, collationNames, options) {
	let hrefs = await assetTagAttr(settings, currentPage, 'css', collationNames, options);
	return hrefs.map(href => `<link rel="stylesheet" href="${href}" />`).join('');
}

module.exports = styleTag;