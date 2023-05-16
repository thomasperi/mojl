const fs = require("fs");
const path = require("path").posix;

const getModuleFilesOfType = require('./getModuleFilesOfType.js');
const devLoaders = require('./devLoaders.js');
const relativizeCssUrls = require('./relativizeCssUrls.js');

// Note: module files are to be copied or symlinked separately

async function buildDevLoaderFile(settings, type) {
	let {
		base,
		modules,
		buildDevDir,
		buildCssFile,
		buildJsFile,
		buildAssetsDir,
	} = settings;
	
	let outputFile = type === 'css' ? buildCssFile : type === 'js' ? buildJsFile : null;

	let outputPath = path.resolve(path.join(base, buildDevDir, outputFile));
	let mirrorDir = path.resolve(path.join(base, buildDevDir, buildAssetsDir));
	let moduleFiles = await getModuleFilesOfType(base, modules, [type]);

	let assetList = [...moduleFiles];
	let urls = [];
	
	for (let file of moduleFiles) {
		// Add to the list of URLs for the loader.
		urls.push(path.relative(path.dirname(outputPath), path.join(mirrorDir, file)));
		
		// Add to the list of URLs used by the stylesheets.
		if (type === 'css') {
			let moduleFilePath = path.join(base, file);
			let moduleCode = await fs.promises.readFile(moduleFilePath, 'utf8');
			relativizeCssUrls(
				moduleCode,
				moduleFilePath,
				outputPath,
				base,
				mirrorDir,
				assetList
			);
		}
	}
	
	let outputCode = devLoaders[type]({urls});
	
	await fs.promises.mkdir(path.dirname(outputPath), {recursive: true});
	await fs.promises.writeFile(outputPath, outputCode, 'utf8');
	
	return assetList;
}

module.exports = buildDevLoaderFile;