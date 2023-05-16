const path = require('path').posix;

const hashStamp = require('./hashStamp.js');
const encodeHtmlAttribute = require('./encodeHtmlAttribute.js');

async function assetTagAttr(settings, currentPage, file, options) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		pageRelativeUrls,
		isDev,
	} = settings;
	
	let docroot = path.join(base, isDev ? buildDevDir : buildDistDir);
	let filePath = path.resolve(path.join(docroot, file));
	let fileUrl = path.join('/', path.relative(docroot, filePath));
	if (pageRelativeUrls) {
		fileUrl = path.relative(path.dirname(currentPage), fileUrl);
	}
	
	let useHash = ( options && Object.hasOwnProperty.call(options, 'hash') ) ?
		options.hash : true;

	if (useHash) {
		fileUrl += await hashStamp(filePath);
	}
	
	return encodeHtmlAttribute(fileUrl);
}

module.exports = assetTagAttr;