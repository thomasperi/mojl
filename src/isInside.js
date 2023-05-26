const path = require('path').posix;

function isInside(child, parent, inclusive = false) {
	// Rather than try to pick the path apart ourselves, let node do it.
	let relative = path.relative(parent, child);
	if (relative === '') {
		return !!inclusive;
	}
	if (path.isAbsolute(relative)) {
		return false;
	}
	for (;;) {
		switch (relative) {
			case '.': return true;
			case '..': return false;
		}
		relative = path.dirname(relative);
	}
}

module.exports = isInside;