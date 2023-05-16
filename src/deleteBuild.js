const fs = require('fs');
const fsp = fs.promises;
const path = require('path').posix;

async function deleteBuild(settings) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		isDev,
	} = settings;
	
	let buildToDelete = path.join(base, (isDev ? buildDevDir : buildDistDir));
	
	await fsp.rm(buildToDelete, {recursive: true, force: true});
}

module.exports = deleteBuild;