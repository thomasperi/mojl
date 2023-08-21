const fs = require('fs');

const fakeTranspilerAsync = {
	inputTypes: ['scss', 'css'],
	run: async ({sourcePaths, entryPath, outputPath, isDev}) => {
		let entry = {
			isEntry: true,
			isDev,
			sourcePaths,
		};
		let output = {
			isOutput: true,
		};
		await fs.promises.writeFile(entryPath, JSON.stringify(entry), 'utf8');
		await fs.promises.writeFile(outputPath, JSON.stringify(output), 'utf8');
	},
};

module.exports = fakeTranspilerAsync;