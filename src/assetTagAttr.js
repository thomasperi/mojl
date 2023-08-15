const fs = require('fs');
const path = require('path').posix;

const hashStamp = require('./hashStamp.js');
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

	// if (settings.collatePages) {
	// 	console.log(JSON.stringify({
	// 		collationNames
	// 	}, null, 2));
	// }
		
	// Convert collation names to urls
	let urls = await Promise.all(
		collationNames.map(
			collName => each(settings, currentPage, `${collName}.${type}`, options)
		)
	);

	// if (settings.collatePages) {
	// 	console.log(JSON.stringify({
	// 		settings,
	// 		urls
	// 	}, null, 2));
	// }

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
	} = settings;
	
	let docroot = path.join(base, isDev ? buildDevDir : buildDistDir);
	let filePath = path.resolve(path.join(docroot, file));

	// if (settings.collatePages) {
	// 	console.log(JSON.stringify({
	// 		filePath
	// 	}, null, 2));
	// }

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
		fileUrl += await hashStamp(filePath);
	}
	
	return encodeHtmlAttribute(fileUrl);
}

module.exports = assetTagAttr;