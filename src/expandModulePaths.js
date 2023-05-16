const fs = require('fs');
const path = require('path').posix;
const standardizeSlashes = require('./standardizeSlashes.js');

// Ignore all paths that consist of characters other than
// an optional single exclamation point at the front, followed by
// hyphens, word characters, slashes, and stars for pseudo-globs.
const validModulePattern = /^!?[-\w/*]+$/;

// Pattern for truncating a path pattern before the stars begin.
const deepestStaticPattern = /\/[^/*]*\*.*$/;

async function expandModulePaths(base, modulePatterns) {
	const results = [];
	const wilds = [];
	for (let modulePattern of modulePatterns) {
		if (!validModulePattern.test(modulePattern)) {
			continue;
		}
		let isWild = modulePattern.includes('*');
		let isNegative = modulePattern.startsWith('!');
		if (isNegative) {
			modulePattern = modulePattern.substring(1);
		}
		let globbyPattern = standardizeSlashes(path.resolve(path.join(base, modulePattern)));
		let regexPattern = globbyToRegexy(globbyPattern);
		let regex = new RegExp(`^${regexPattern}$`);
		let directoryToRead = globbyPattern.replace(deepestStaticPattern, '');

		let foundModules = (
			fs.existsSync(directoryToRead) &&
			fs.statSync(directoryToRead).isDirectory()
		) ? (await findModules(directoryToRead)) : [];
		
		let matchedModules = foundModules.filter(item => regex.test(item));
		if (isNegative) {
			negate(matchedModules, results, wilds);
		} else {
			integrate(matchedModules, results, wilds, isWild);
		}
	}
	return results.map(module => path.relative(base, module));
}

function negate(matchedModules, results, wilds) {
	for (let module of matchedModules) {
		removeItem(results, module);
		removeItem(wilds, module);
	}
}

function integrate(matchedModules, results, wilds, isWild) {
	for (let module of matchedModules) {
		// If an non-wild item was wild-carded before,
		// remove it from the results as well as the wildcard list.
		if (!isWild && wilds.includes(module)) {
			removeItem(results, module);
			removeItem(wilds, module);
		}
		// If the results doesn't already include the item, append it.
		if (!results.includes(module)) {
			results.push(module);
			// If this is a wildcard, add it to that list too.
			if (isWild) {
				wilds.push(module);
			}
		}
	}
}

function removeItem(array, item) {
	if (array.includes(item)) {
		array.splice(array.indexOf(item), 1);
	}
}

function globbyToRegexy(globbyPattern) {
	return (globbyPattern
		// Replace `/**/` with multi-segment traversal regex:
		// Zero or more of [a slash followed by one or more characters].
		// The tail slash is matched in a lookahead, so gets no replacement.
		// Use `{0,}` instead of `*` so that we can replace single stars next.
		.replace(/\/\*\*(?=\/)/g, '(/.+){0,}')

		// Replace `*` with single-segment regex:
		// Zero or more non-slash characters.
		.replace(/\*/g, '([^/]){0,}')
	);
}

async function findModules(dir, found = []) {
	const prefix = path.join(dir, path.basename(dir) + '.');
	let dirIsKnownToBeAModule = false;

	dir = standardizeSlashes(dir);
	const subdirs = [];
	for (let item of await fs.promises.readdir(dir)) {
		if (item === '.' || item === '..') {
			continue;
		}
		item = path.join(dir, item);
		const stat = fs.statSync(item);
		if (!dirIsKnownToBeAModule && stat.isFile() && item.startsWith(prefix)) {
			found.push(dir);
			dirIsKnownToBeAModule = true;
		}
		if (stat.isDirectory()) {
			subdirs.push(item);
		}
	}
	
	for (let subdir of subdirs) {
		await findModules(subdir, found);
	}
	
	return found;
}

module.exports = expandModulePaths;
