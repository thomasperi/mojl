const path = require("path").posix;

function requireAdapter(base, adapter) {
	if (adapter) {
		if (adapter.startsWith('./') || adapter.startsWith('../')) {
			adapter = path.join(base, adapter);
		}
		return require(adapter);
	}
}

module.exports = requireAdapter;