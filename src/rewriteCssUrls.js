async function rewriteCssUrls(cssCode, replacerFunction) {
	const regex = /(url\()|(\))|(?:(["'])(?:\\.|(?!\3).)*\3)|(?:\/\*.*?\*\/)|(?:\/\/.*?(?=[\r\n]))/g;
	const absoluteRegex = /^(\/|\w+:\/\/)/;
	const urlOpen = 1;
	const urlClose = 2;
	// Non-capturing:
	// * Quoted String (the quote is captured for backref \3)
	// * Block Comment
	// * Line Comment
	//   - Invalid CSS, but accounting for them lets us use this same
	//     function on most SCSS

	// Use a loop instead of cssCode.replace() because the regex is crazy enough
	// as it is, without trying to match both quoted and unquoted URLs inside url()
	// as well as quoted strings in other places
	const result = [];
	let index = 0;
	let urlIndex;
	let matches;
	let match;
	let inUrl = false;
	while ( (matches = regex.exec(cssCode)) !== null) {
		if (inUrl) {
			if ( (match = matches[urlClose]) ) {
				let url = cssCode.substring(urlIndex, matches.index).trim();
				let quote = url.charAt(0);
				if (quote === '"' || quote === "'") {
					url = url.substr(1, url.length - 2);
				} else {
					quote = '';
				}
				if (!absoluteRegex.test(url)) {
					url = await replacerFunction(url);
				}
				result.push(quote + url + quote);
				result.push(match);
				inUrl = false;
			}
		} else { // not in url
			result.push(cssCode.substring(index, matches.index));
			if ( (match = matches[urlOpen]) ) {
				result.push(match);
				urlIndex = regex.lastIndex;
				inUrl = true;
			} else {
				result.push(matches[0]);
			}
		}
		index = regex.lastIndex;
	}
	result.push(cssCode.substring(index));

	return result.join('');
}

module.exports = rewriteCssUrls;