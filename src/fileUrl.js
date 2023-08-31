const path = require('path').posix;

/*

// pageRelativeUrls: false
${mojl.file('photos/pie.jpg')}
	-> /assets/pages/recipes/pie/photos/pie.jpg?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~

// pageRelativeUrls: true
// (from url /recipes/pie/index.html)
${mojl.file('photos/pie.jpg')}
	-> ../../assets/pages/recipes/pie/photos/pie.jpg?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~
	
// pageRelativeUrls: false
${mojl.file('photos/pie.jpg', {hash: false})}
	-> /assets/pages/recipes/pie/photos/pie.jpg

*/

async function fileUrl(settings, currentTemplate, currentDocument, filePath, options) {
	// RFC 2396
	// scheme        = alpha *( alpha | digit | "+" | "-" | "." )
	// net_path      = "//" authority [ abs_path ]
	if (/^([a-z][a-z0-9.+-]*:)?\/\//i.test(filePath)) {
		return filePath;
	}
	
	let {
		base,
		buildAssetsDir,
		pageRelativeUrls,
		_cache,
	} = settings;

	let isAbsolute = filePath.startsWith('/');
	
	// A relative path gets absolutized relative to the current included template file.
	let absolutePath = isAbsolute ?
		filePath :
		path.resolve(path.join(path.dirname(currentTemplate), filePath));
	
	let absoluteUrl = path.join('/', buildAssetsDir, path.relative(base, absolutePath));

	let useHash = ( options && Object.hasOwnProperty.call(options, 'hash') ) ?
		options.hash : true;
		
	if (useHash) {
		absoluteUrl += await _cache.stampAbs(absolutePath);
	}

	return pageRelativeUrls ?
		path.relative(path.dirname(currentDocument), absoluteUrl) :
		absoluteUrl;
}


module.exports = fileUrl;