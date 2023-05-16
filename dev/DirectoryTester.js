const fs = require('fs');
const path = require('path').posix;

const { Clone } = require('sandbox-clone');

function DirectoryTester(filename, options = {}) {
	const source = filename.replace(/\.js$/, '');
	const name = path.basename(source);
	const cloneOptions = fs.existsSync(source) ? {source, ...options} : options;
	
	this.name = name;
	
	this.cloneRun = async (fn) => {
		const box = new Clone(cloneOptions);
		const base = box.base();
		const realCwd = process.cwd();
		try {
			process.chdir(base);
			await box.run(async base => await fn(base, box));
		} finally {
			process.chdir(realCwd);
			box.destroy();
		}
	};
	
}

module.exports = DirectoryTester;