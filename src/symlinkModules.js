const fs = require("fs");
const path = require("path").posix;

// linkRoot is the directory under which linking could begin,
// but actual linking starts at the topmost modules themselves.
async function symlinkModules(base, linkRoot, expandedModules) {
	const orderedModules = [...expandedModules].sort();
	const linked = [];
	for (let module of orderedModules) {
		if (linked.some(link => module.startsWith(link + '/'))) {
			continue;
		}
		let linkToCreate = path.join(base, linkRoot, module);
		let linkParent = path.dirname(linkToCreate);
		let targetExisting = path.join(base, module);
		let targetRelative = path.relative(linkParent, targetExisting);
		
		await fs.promises.mkdir(linkParent, {recursive: true});
		await fs.promises.symlink(targetRelative, linkToCreate);
		
		linked.push(module);
	}
	return linked;
}

module.exports = symlinkModules;