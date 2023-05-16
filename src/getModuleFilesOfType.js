const fs = require("fs");
const path = require("path").posix;

async function getModuleFilesOfType(base, expandedModules, types) {
	const results = [];
	for (let module of expandedModules) {
		let basename = path.basename(module);
		for (let type of types) {
			let filepath = path.join(base, module, `${basename}.${type}`);
			if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
				results.push(filepath);
				break;
			}
		}
	}
	return results.map(module => path.relative(base, module));
}

module.exports = getModuleFilesOfType;