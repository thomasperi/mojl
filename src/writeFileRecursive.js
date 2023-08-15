const fs = require('fs');
const path = require('path').posix;

async function writeFileRecursive(file, data, options) {
	await fs.promises.mkdir(path.dirname(file), {recursive: true});
	await fs.promises.writeFile(file, data, options);
}

module.exports = writeFileRecursive;
