const fs = require('fs');

function createDevLoaderTemplate(file) {
	let code = fs.readFileSync(file, 'utf8');

	// Use extended block comments as delimiters so that JS templates
	// can be linted as long as the delimiter outputs function arguments.
	// JSLint will just see an empty argument list.
	const delimiter = /\/\*\{=((?:\n|\r|.)+?)\}\*\//g;
	const fn = function () {
		/*eslint-disable-next-line no-eval */
		return code.replace(delimiter, (match, expression) => eval(expression));
	};
	return props => fn.call(props);
}

module.exports = createDevLoaderTemplate;