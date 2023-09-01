const path = require("path").posix;

const defaults = require('./Options.js');
const expandModulePaths = require('./expandModulePaths.js');
const findPageModules = require('./findPageModules.js');
const HashCache = require('./HashCache.js');

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
		
		// All options are representable in JSON, so we can use it to make an easy deep clone.
		if (actualType === 'array' || actualType === 'object') {
			value = JSON.parse(JSON.stringify(value));
		}
		
		expanded[key] = value;
	});
	
	// Resolve the base
	expanded.base = path.resolve(expanded.base);
	
	// Ensure arrays have items of the correct type.
	['excludeFileTypesFromMirror'].forEach(key => {
		expanded[key] = expanded[key].map(item => `${item}`);
	});

	// Get the names of any page modules to create automatic collations from.
	let pageModules = expanded.collatePages ? (await findPageModules(expanded)) : [];
	
	// Expand explicit collations.
	let prefixIndex = 0;
	for (let coll of expanded.collations) {
	
		// Add names to any nameless collations.
		if (!has.call(coll, 'name')) {
			coll.name = expanded.collationNamePrefix;
			if (prefixIndex > 0) {
				coll.name += `-${prefixIndex}`;
			}
			prefixIndex++;
		}
		
		// Remove any page collations that might have been added via findPageModules above.
		let mods = await expandModulePaths(expanded.base, coll.modules);
		coll.modules = mods.filter(mod => !pageModules.includes(mod));
	}
	
	// Add automatic page collations
	for (let pageMod of pageModules) {
		let suffixed = path.relative(
			expanded.templateHomeModule,
			pageMod + expanded.templateOutputSuffix
		);
		let page = path.join('/', suffixed);
		let name = path.join(path.dirname(suffixed), path.parse(suffixed).name);
		
		if (expanded.collations.some(coll => coll.name === name)) {
			throw `Collation name collision: ${name}`;
		}
		expanded.collations.push({ name, modules: [pageMod], page });
	}

	// Add the frontend library to the first collation.
	if (expanded.useFrontendLibrary && expanded.collations.length > 0) {
		expanded.collations[0].modules.unshift('node_modules/mojl/frontend');
	}
	
	expanded._cache = new HashCache(expanded);

	return expanded;
}

module.exports = expandOptions;