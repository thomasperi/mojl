const fs = require('fs');
const path = require('path').posix;

const encodeHtmlAttribute = require('./encodeHtmlAttribute.js');

async function assetTagAttr(settings, currentPage, type, collationNames, options) {

	// Use all collations if none specified
	if (collationNames === null || collationNames === undefined) {
		collationNames = (settings.collations
			.filter(coll => !coll.page)
			.map(coll => coll.name)
		);
		if (settings.collatePages) {
			collationNames.push(''); // Empty string means current page
		}
	}

	// Wrap in array if not already
	if (!(collationNames instanceof Array)) {
		collationNames = [collationNames];
	}

	// Convert empty string to current page
	collationNames = collationNames.map(collName => {
		if (collName === '') {
			settings.collations.some(coll => {
				if (coll.page === currentPage) {
					collName = coll.name;
					return true;
				}
			});
		}
		return collName;
	});	
		
	// Convert collation names to urls
	let urls = await Promise.all(
		collationNames.map(
			collName => each(settings, currentPage, `${collName}.${type}`, options)
		)
	);

	// Remove the ones that don't exist
	return urls.filter(url => !!url);
}

async function each(settings, currentPage, file, options) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		pageRelativeUrls,
		isDev,
		_cache,
	} = settings;
	
	const buildDir = isDev ? buildDevDir : buildDistDir;
	const docroot = path.join(base, buildDir);
	const filePath = path.resolve(path.join(docroot, file));

	if (!fs.existsSync(filePath)) {
		return;
	}
	
	let fileUrl = path.join('/', path.relative(docroot, filePath));
	if (pageRelativeUrls) {
		fileUrl = path.relative(path.dirname(currentPage), fileUrl);
	}
	
	let useHash = ( options && Object.hasOwnProperty.call(options, 'hash') ) ?
		options.hash : true;

	if (useHash) {
		fileUrl += await _cache.stampAbs(filePath);
	}
	
	return encodeHtmlAttribute(fileUrl);
}

module.exports = assetTagAttr;