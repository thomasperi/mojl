/**
 * A dev loader for scripts that will be concatenated in production.
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */
/*global document, console, setTimeout */
(function (urls) {
	// document.currentScript polyfill, doesn't work with async attribute.
	// https://2ality.com/2014/05/current-script.html 
	var currentScript = document.currentScript || (function () {
		var tags = document.getElementsByTagName('script');
		return tags[tags.length - 1];
	})();
	
	// Find the path prefix for adding script urls relative to this one.
	var relative = currentScript.getAttribute('src').replace(/[^\/]+$/, '');
	
	// Add a URL as a script tag.
	function load(url) {
		var script = document.createElement('script');
		
		// Wait for each script to load before adding the next script tag,
		// to ensure that they load in the intended order.
		// It's slow, but it's not for production anyway.
		script.onload = next;
		
		script.src = relative + url;
		console.log(url + ' => ' + script.src);
		currentScript.parentNode.insertBefore(script, currentScript);
	}
	
	// Add all the script urls passed in.
	console.log('=== mojl dev mode : adding scripts ===');
	var i = 0;
	function next() {
		if (i < urls.length) {
			load(urls[i++]);
		} else {
			setTimeout(function () {
				console.log('=== mojl dev mode : done adding scripts ===');
			}, 0);
		}
	}
	if (urls) {
		next();
	}
	
}(["../modules-c/shell/shell.js?t=1600887548203","../modules-d/shell/shell.js?t=1600887595670","../modules-d/nav/nav.js?t=1600887583292","../modules-c/main/main.js?t=1600887505373","../modules-d/footer/footer.js?t=1600887565038"]));