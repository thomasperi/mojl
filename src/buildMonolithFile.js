const fs = require("fs");
const path = require("path").posix;

const getModuleFilesOfType = require('./getModuleFilesOfType.js');
const relativizeCssUrls = require('./relativizeCssUrls.js');

async function buildMonolithFile(settings, type) {
	const assetList = await Promise.all(Object.keys(settings.collations).map(collationName => {
		return each(settings, collationName, settings.collations[collationName], type);
	}));
	return assetList.reduce((acc, curr) => acc.concat(curr), []);
}

async function each(settings, name, modules, type) {
	let {
		base,
		buildDistDir,
		buildAssetsDir,
		cssMinifierAdaptor,
		jsMinifierAdaptor,
	} = settings;
	
	let outputFile = `${name}.${type}`;
	let minifierFn = type === 'css' ? cssMinifierAdaptor : type === 'js' ? jsMinifierAdaptor : null;

	let outputPath = path.resolve(path.join(base, buildDistDir, outputFile));
	let mirrorDir = path.resolve(path.join(base, buildDistDir, buildAssetsDir));
	let moduleFiles = await getModuleFilesOfType(base, modules, [type]);
	let outputCode = '/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */';
	let assetList = [];
	
	for (let file of moduleFiles) {
		let moduleFilePathOriginal = path.join(base, file);
		let moduleCode = await fs.promises.readFile(moduleFilePathOriginal, 'utf8');
		if (type === 'css') {
			moduleCode = await relativizeCssUrls(
				moduleCode,
				moduleFilePathOriginal,
				outputPath,
				base,
				mirrorDir,
				assetList
			);
		}
		outputCode += '\n' + moduleCode; // Linebreak lets JS minifiers do ASI.
	}
	
	if (minifierFn) {
		outputCode = await minifierFn(outputCode);
	}
	
	await fs.promises.mkdir(path.dirname(outputPath), {recursive: true});
	await fs.promises.writeFile(outputPath, outputCode, 'utf8');
	
	return assetList;
}

module.exports = buildMonolithFile;