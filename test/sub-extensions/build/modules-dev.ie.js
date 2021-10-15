/**
 * A dev loader for individually loading the scripts
 * that will be concatenated by mojl in production.
 *
 * Confirmed working in:
 *   Chrome 15 +
 *   Edge 15 +
 *   Firefox 4 +
 *   IE 10 +
 *   Opera 11.5 +
 *   Safari 4 +
 *
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */
/*global document, console */
(function (urls) {
	if (!urls) {
		return;
	}
	
	// Get the tag that loaded this very script.
	var loader = document.currentScript || (function () {
		// document.currentScript polyfill, doesn't work with async attribute.
		// https://2ality.com/2014/05/current-script.html 
		var tags = document.getElementsByTagName('script');
		return tags[tags.length - 1];
	})();

	// Find the path prefix for adding script urls relative to this one.
	var relative = loader.getAttribute('src').replace(/[^\/]+$/, '');

	var a = document.createElement('a'),
		url,
		log = [],
		html = [];
	
	// Start the console message.
	log.push('=== mojl dev loader ===');
	
	// Loop through the URLs.
	while (urls.length > 0) {
		// Normalize each URL and add it to the console message.
		a.href = relative + urls.shift();
		url = a.href;
		log.push('* ' + url);
		
		// Encode the URL for use in HTML, then write the script tag.
		html.push('<script src="' + (url
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
		) + '"></script>');
	}

	// Output the message.
	console.log(log.join('\n'));
	
	// Instead of creating and inserting script elements, use document.write
	// to simulate as closely as possible the synchronous loading of a
	// concatenated script: Scripts are loaded in order and before the rest
	// of the document is encountered by the parser.
	// (Allow evil for this one part, because we know what we're doing.)
	/* jshint evil: true */
	document.write(html.join(''));
	/* jshint evil: false */
	
}(["../modules/nav/nav.ie.js?t=1590271328605","../modules/shell/shell.ie.js?t=1590270237628"]));