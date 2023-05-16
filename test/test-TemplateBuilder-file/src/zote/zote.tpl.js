const path = require('path').posix;
const icon = path.join(__dirname, '../foo/icon.gif');
module.exports = (mojl, props) => mojl.template`zote(${
	mojl.file(icon)
})`;