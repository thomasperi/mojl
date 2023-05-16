const path = require("path").posix;

const defaults = require('./Options.js');
const expandModulePaths = require('./expandModulePaths.js');

const has = Object.prototype.hasOwnProperty;
const { isArray } = Array;

async function expandOptions(options) {
	options = ((typeof options === 'object') && options) || {};
	let expanded = {};
	
	// Ensure data types are correct on top-level options.
	Object.keys(defaults).forEach(key => {
		let value = has.call(options, key) ? options[key] : defaults[key];
		
		if (isArray(defaults[key])) {
			if (isArray(value)) {
				value = [...value];
			} else {
				value = [value];
			}
		
		} else if (typeof defaults[key] === 'string') {
			value = `${value}`;
			
		} else if (typeof defaults[key] === 'boolean') {
			value = !!value;
		}
		
		expanded[key] = value;
	});
	expanded.base = path.resolve(expanded.base);
	expanded.modules = await expandModulePaths(expanded.base, expanded.modules);
	
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