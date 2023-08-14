const fs = require('fs');
const path = require('path').posix;

const symlinkModules = require('./symlinkModules.js');
const requireAdaptor = require('./requireAdaptor.js');

async function mirrorAssets(settings) {
	const {
		base,
		collations,
		buildDevDir,
		buildDistDir,
		buildAssetsDir,
		symlinkDevAssets,
		symlinkDistAssets,
		cssTranspilerAdaptor,
		excludeFileTypesFromMirror,
		isDev,
	} = settings;

	let transpilerAdaptor = requireAdaptor(base, cssTranspilerAdaptor)

	const mirror = path.join(
		isDev ? buildDevDir : buildDistDir,
		buildAssetsDir
	);
	
	let modules = Object.values(collations);
	modules = modules.reduce((acc, curr) => acc.concat(curr), []);
	modules = [...new Set(modules)];
	
	if (
		(symlinkDevAssets && isDev) ||
		(symlinkDistAssets && !isDev)
	) {
		await symlinkModules(base, mirror, modules);
		
	} else {
		const transpilerTypes = transpilerAdaptor ? transpilerAdaptor.inputTypes : [];
		
		const exclude = [
			...transpilerTypes,
			...excludeFileTypesFromMirror,
			...(isDev ? [] : ['css', 'js']),
		];
		
		let excludePattern = `(?:\\.tpl\\.js)`;
		if (exclude.length > 0) {
			const typesPattern = `(?:${ exclude.join('|') })`;
			const doubledPattern = `(?:/(.+?)/\\1\\.${ typesPattern })`;
			excludePattern += `|${ doubledPattern }`;
		}
		const excludeRegex = new RegExp(`(?:${excludePattern})$`);
		
		await copyModules(base, mirror, modules, excludeRegex);
	}
}

// copyRoot is the directory under which linking could begin,
// but actual linking starts at the topmost modules themselves.
async function copyModules(base, copyRoot, expandedModules, excludeRegex) {
	const orderedModules = [...expandedModules].sort();
	const copied = [];
	for (let module of orderedModules) {
		if (copied.some(copy => module.startsWith(copy + '/'))) {
			continue;
		}
		let src = path.join(base, module);
		let dest = path.join(base, copyRoot, module);
		
		await copyModuleDirectory(src, dest, excludeRegex);
		copied.push(module);
	}
	return copied;
}

async function copyModuleDirectory(src, dest, excludeRegex) {
	await fs.promises.mkdir(dest, {recursive: true});
	for (let item of await fs.promises.readdir(src)) {
		if (item === '.' || item === '..') {
			continue;
		}
		let srcItem = path.join(src, item);
		let destItem = path.join(dest, item);
		let stat = fs.statSync(srcItem);
		if (stat.isDirectory()) {
			await copyModuleDirectory(srcItem, destItem, excludeRegex);
		} else if (stat.isFile()) {
			if (!excludeRegex || !excludeRegex.test(srcItem)) {
				await fs.promises.copyFile(srcItem, destItem);
			}
		}
	}
}

module.exports = mirrorAssets;