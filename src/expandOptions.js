const path = require("path").posix;

const defaults = require('./Options.js');
const expandModulePaths = require('./expandModulePaths.js');

const has = Object.prototype.hasOwnProperty;
const { isArray } = Array;

const getType = v => isArray(v) ? 'array' : v === null ? 'null' : typeof v;

async function expandOptions(options) {
	let expanded = {};
	if (getType(options) !== 'object') {
		options = {};
	}
	
	// Ensure data types are correct on top-level options.
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
	
	expanded.base = path.resolve(expanded.base);
	
	expanded.modules = await expandModulePaths(expanded.base, expanded.modules);
	
	let colls = expanded.collations;
	for (let name of Object.keys(colls)) {
		colls[name] = await expandModulePaths(expanded.base, colls[name]);
	}
	expanded.collations = colls;
	
	
	// Load node modules for options that are module descriptors
	['cssTranspilerAdaptor', 'cssMinifierAdaptor', 'jsMinifierAdaptor'].forEach(key => {
		let adaptor = expanded[key];
		if (adaptor) {
			if (adaptor.startsWith('./') || adaptor.startsWith('../')) {
				adaptor = path.join(expanded.base, adaptor);
			}
			expanded[key] = require(adaptor);
		}
	});
	
	// Ensure arrays have items of the correct type.
	['modules', 'excludeFileTypesFromMirror'].forEach(key => {
		expanded[key] = expanded[key].map(item => `${item}`);
	});

	return expanded;
}

module.exports = expandOptions;