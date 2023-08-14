const fs = require("fs");
const path = require("path").posix;

const getModuleFilesOfType = require('./getModuleFilesOfType.js');
const relativizeCssUrls = require('./relativizeCssUrls.js');
const requireAdaptor = require('./requireAdaptor.js');

async function buildTranspilerFile(settings) {
	const assetList = await Promise.all(Object.keys(settings.collations).map(collationName => {
		return each(settings, collationName, settings.collations[collationName]);
	}));
	return assetList.reduce((acc, curr) => acc.concat(curr), []);
}

async function each(settings, name, modules) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		buildTempDir,
		buildAssetsDir,
		cssTranspilerAdaptor,
		isDev,
	} = settings;
	
	let transpilerAdaptor = requireAdaptor(base, cssTranspilerAdaptor);
	let types = transpilerAdaptor.inputTypes;
	let buildDir = isDev ? buildDevDir : buildDistDir;
	let buildCssFile = `${name}.css`;
	let entryFile = `${buildCssFile}.${types[0]}`;
	
	let outputPath = path.resolve(path.join(base, buildDir, buildCssFile));
	let mirrorDir = path.resolve(path.join(base, buildDir, buildAssetsDir));
	let entryPath = path.resolve(path.join(base, buildDir, buildTempDir, entryFile));
	let tempMirrorDir = path.resolve(path.join(base, buildDir, buildTempDir, buildAssetsDir));
	let moduleFiles = await getModuleFilesOfType(base, modules, types);
	let assetList = [];
	
	for (let file of moduleFiles) {
		let moduleFilePathOriginal = path.join(base, file);
		let moduleFilePathMirror = path.join(base, buildDir, buildTempDir, buildAssetsDir, file);
		let moduleCode = await relativizeCssUrls(
			await fs.promises.readFile(moduleFilePathOriginal, 'utf8'),
			moduleFilePathOriginal,
			outputPath,
			base,
			mirrorDir,
			assetList
		);
		await fs.promises.mkdir(path.dirname(moduleFilePathMirror), {recursive: true});
		await fs.promises.writeFile(moduleFilePathMirror, moduleCode, 'utf8');
	}

	let sourcePaths = moduleFiles.map(
		file => path.relative(path.dirname(entryPath), path.join(tempMirrorDir, file))
	);
	
	await fs.promises.mkdir(path.dirname(entryPath), {recursive: true});
	await fs.promises.mkdir(path.dirname(outputPath), {recursive: true});

	transpilerAdaptor.run({sourcePaths, entryPath, outputPath, isDev});
	
	if (!isDev) {
		let tempDirToDelete = path.resolve(path.join(base, buildDir, buildTempDir));
		await fs.promises.rm(tempDirToDelete, { recursive: true, force: true });
	}
	
	return assetList;
}

module.exports = buildTranspilerFile;