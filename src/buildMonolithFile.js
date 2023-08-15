const fs = require("fs");
const path = require("path").posix;

const getModuleFilesOfType = require('./getModuleFilesOfType.js');
const relativizeCssUrls = require('./relativizeCssUrls.js');
const requireAdapter = require('./requireAdapter.js');
const writeFileRecursive = require('./writeFileRecursive.js');

// to-do: rename this method as plural

// async function buildMonolithFile(settings, type) {
// 	const assetList = await Promise.all(Object.keys(settings.collations).map(collationName => {
// 		return each(settings, collationName, settings.collations[collationName], type);
// 	}));
// 	return assetList.reduce((acc, curr) => acc.concat(curr), []);
// }

async function buildMonolithFile(settings, type) {
	const assetList = await Promise.all(settings.collations.map(
		coll => each(settings, coll.name, coll.modules, type)
	));
	return assetList.reduce((acc, curr) => acc.concat(curr), []);
}

async function each(settings, name, modules, type) {
	let {
		base,
		buildDistDir,
		buildAssetsDir,
		cssMinifierAdapter,
		jsMinifierAdapter,
	} = settings;
	
	let outputFile = `${name}.${type}`;
	let minifierFn =
		type === 'css' ? requireAdapter(base, cssMinifierAdapter) :
			type === 'js' ? requireAdapter(base, jsMinifierAdapter) : null;

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
	
	if (outputCode.trim()) {
		await writeFileRecursive(outputPath, outputCode, 'utf8');
	}
	
	return assetList;
}

module.exports = buildMonolithFile;