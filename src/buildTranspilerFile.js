const fs = require("fs");
const path = require("path").posix;

const getModuleFilesOfType = require('./getModuleFilesOfType.js');
const relativizeCssUrls = require('./relativizeCssUrls.js');
const requireAdapter = require('./requireAdapter.js');
const writeFileRecursive = require('./writeFileRecursive.js');

async function buildTranspilerFile(settings) {
	const assetList = await Promise.all(settings.collations.map(
		coll => each(settings, coll.name, coll.modules)
	));
	return assetList.reduce((acc, curr) => acc.concat(curr), []);
}

async function each(settings, name, modules) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		buildAssetsDir,
		cssTranspilerAdapter,
		isDev,
	} = settings;
	
	let transpilerAdapter = requireAdapter(base, cssTranspilerAdapter);
	let types = transpilerAdapter.inputTypes;
	let buildDir = isDev ? buildDevDir : buildDistDir;
	let buildCssFile = `${name}.css`;
	let entryFile = `${buildCssFile}.${types[0]}`;

	let buildPath = path.join(base, buildDir);
	await fs.promises.mkdir(buildPath, {recursive: true});
	let tempPath = await fs.promises.mkdtemp(path.join(buildPath, 'temp-'));
	
	let outputPath = path.resolve(path.join(buildPath, buildCssFile));
	let mirrorDir = path.resolve(path.join(buildPath, buildAssetsDir));
	let entryPath = path.resolve(path.join(tempPath, entryFile));
	let tempMirrorDir = path.resolve(path.join(tempPath, buildAssetsDir));
	let moduleFiles = await getModuleFilesOfType(base, modules, types);
	let assetList = [];
	
	for (let file of moduleFiles) {
		let moduleFilePathOriginal = path.join(base, file);
		let moduleFilePathMirror = path.join(tempPath, buildAssetsDir, file);
		let moduleCode = await relativizeCssUrls(
			await fs.promises.readFile(moduleFilePathOriginal, 'utf8'),
			moduleFilePathOriginal,
			outputPath,
			base,
			mirrorDir,
			assetList
		);
		await writeFileRecursive(moduleFilePathMirror, moduleCode, 'utf8');
	}

	let sourcePaths = moduleFiles.map(
		file => path.relative(path.dirname(entryPath), path.join(tempMirrorDir, file))
	);
	
	await fs.promises.mkdir(path.dirname(entryPath), {recursive: true});
	await fs.promises.mkdir(path.dirname(outputPath), {recursive: true});

	await transpilerAdapter.run({sourcePaths, entryPath, outputPath, isDev});
	
	if (!isDev) {
		await fs.promises.rm(tempPath, { recursive: true, force: true });
	}
	
	return assetList;
}

module.exports = buildTranspilerFile;