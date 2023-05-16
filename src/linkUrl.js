const path = require('path').posix;

function linkUrl(settings, currentPage, url) {
	// RFC 2396
	// scheme        = alpha *( alpha | digit | "+" | "-" | "." )
	// net_path      = "//" authority [ abs_path ]
	if (/^([a-z][a-z0-9.+-]*:)?\/\//i.test(url)) {
		return url;
	}
	
	let isRelative = !url.startsWith('/');
	let currentDir = path.dirname(currentPage);
	let tailSlash = url.endsWith('/') ? '/' : '';
	
	if (settings.pageRelativeUrls) {
		if (isRelative) {
			return url;
		} else {
			return path.relative(currentDir, url) + tailSlash;
		}
	} else {
		if (isRelative) {
			return path.resolve(path.join(currentDir, url)) + tailSlash;
		} else {
			return url;
		}
	}
}

module.exports = linkUrl;