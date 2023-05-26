const path = require('path').posix;
const icon = path.join(__dirname, '../foo/icon.gif');
module.exports = (tpl, props) => tpl`zote(${
	tpl.file(icon)
})`;