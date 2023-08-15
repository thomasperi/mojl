const path = require("path").posix;

const defaults = require('./Options.js');
const expandModulePaths = require('./expandModulePaths.js');
const findPageModules = require('./findPageModules.js');

const has = Object.prototype.hasOwnProperty;
const { isArray } = Array;

const getType = v => isArray(v) ? 'array' : v === null ? 'null' : typeof v;

async function expandOptions(options) {
	let expanded = {};
	if (getType(options) !== 'object') {
		options = {};
	}
	
	// Populate missing options and ensure data types on top-level options are correct.
	Object.keys(defaults).forEach(key => {
		let value = has.call(options, key) ? options[key] : defaults[key];
		let actualType = getType(value);
		let expectedType = getType(defaults[key]);

		if (expectedType !== actualType) {
			throw `expected '${key}' option to be ${expectedType} but got ${actualType} instead`;
		}
		
		if (actualType === 'array' || actualType === 'object') {
			value = JSON.parse(JSON.stringify(value));
		}
		
		expanded[key] = value;
	});
	
	// Resolve the base
	expanded.base = path.resolve(expanded.base);
	
	// Get the names of any page modules to create automatic collations from.
	let pageModules = expanded.collatePages ? (await findPageModules(expanded)) : [];
	
	// Expand explicit collations, removing any page collations.
	let colls = expanded.collations;
	for (let name of Object.keys(colls)) {
		let mods = await expandModulePaths(expanded.base, colls[name]);
		colls[name] = mods.filter(mod => !pageModules.includes(mod));
	}
	
	// Add automatic page collations
	for (let pageMod of pageModules) {
		let pageColl = path.join(pageMod, expanded.templateOutputSuffix)
		pageColl = path.join(path.dirname(pageColl), path.parse(pageColl).name);
		pageColl = path.relative(expanded.templateHomeModule, pageColl);
		
		if (has.call(colls, pageColl)) {
			throw `Collation name collision: ${pageColl}`;
		}
		colls[pageColl] = [pageMod];
	}
	
	// to-do:
	// Need a prefix to differentiate the automatic page collations from the regular ones.
	// Maybe start page collations with a dot (or other character... a star? a pound?),
	// strip the dot when writing files,
	// and ignore dot collations when writing script and link tags. 
	
	// Ensure arrays have items of the correct type.
	['excludeFileTypesFromMirror'].forEach(key => {
		expanded[key] = expanded[key].map(item => `${item}`);
	});

	return expanded;
}

module.exports = expandOptions;