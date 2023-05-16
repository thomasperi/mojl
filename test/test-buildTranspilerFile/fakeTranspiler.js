const fs = require('fs');

const fakeTranspiler = {
	inputTypes: ['scss', 'css'],
	run: ({sourcePaths, entryPath, outputPath, isDev}) => {
		let entry = {
			isEntry: true,
			isDev,
			sourcePaths,
		};
		let output = {
			isOutput: true,
		};
		fs.writeFileSync(entryPath, JSON.stringify(entry), 'utf8');
		fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
	},
};

module.exports = fakeTranspiler;