const path = require("path").posix;

function requireAdaptor(base, adaptor) {
	if (adaptor) {
		if (adaptor.startsWith('./') || adaptor.startsWith('../')) {
			adaptor = path.join(base, adaptor);
		}
		return require(adaptor);
	}
}

module.exports = requireAdaptor;