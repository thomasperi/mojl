/*!
 * mojl v1.1.0-dev
 *
 * A node module to allow "content modules" with related assets grouped
 * together during development, and concatenate each file type from all the
 * modules into single monolithic .js, .css, etc. files.
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */

/*global require, module, __dirname, console */

// Dependencies
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const rewriteCssUrls = require('rewrite-css-urls');

// Stashed warnings
let warnings = [];

/**
 * Default configuration options
 */
const config_defaults = {
	// The base directory for everything mojl does.
	// Required. (Don't uncomment)
// 	"base": "./web/wp-content/themes/your-theme",

	/**
	 * config.file_types
	 *
	 * Describe how to handle files of each type.
	 */
	"file_types": {
		"css": {
			"comment": "block",
			"rewrite": "css"
		},
		"js": {
			"comment": "block"
		}
	},
	
	/**
	 * config.dir_mappings
	 * 
	 * An array of objects describing the directories involved in the build.
	 * Each object describes a set of concatenated files (a "build") and which
	 * modules are used in building it.
	 *
	 * The order of the objects in the array should be the same order in which
	 * you intend to load them on the site.
	 *
	 * Each object in the array has two keys:
	 *
	 * > "build" (string)
	 *
	 *   The path to where the concatenated files will be saved.
	 *   The endpoint of this path is not a directory, but the prefix
	 *   of each concatenated file.
	 *
	 *   For example, "build": "build/modules" might create files named:
	 *     {config.base}/build/modules-dev.css
	 *     {config.base}/build/modules-dev.js
	 *     {config.base}/build/modules.css
	 *     {config.base}/build/modules.js
	 *
	 * > "modules" (array of strings)
	 *
	 *   Each string in this array refers to the path to a module,
	 *   or a wildcard to load all modules in a certain directory
	 *   in alphabetical order.
	 *
	 *   For example:
	 *     "modules/nav" loads the "nav" module inside {config.base}/modules/
	 *     "modules/*" loads ALL modules inside {config.base}/modules/
	 *
	 *   If a wildcard is listed in the same array as an explicit reference
	 *   to a module matched by the wildcard, the item retains its position
	 *   instead of expanding from the wildcard into a duplicate listing.
	 *
	 *   For example, if ["modules/*"] expands to:
	 *     ["modules/contact", "modules/foot", "modules/nav", "modules/shell"]
	 *
	 *   Then ["modules/shell", "modules/*", "modules/foot"] expands to:
	 *     ["modules/shell", "modules/contact", "modules/nav", "modules/foot"]
	 */
	"dir_mappings": [
		{
			"build": "build/modules",
			"modules": [
				"modules/*"
			]
		}
	],

	/*
	to-do: let modules require other modules
		for example, let foo/bar/bar.mojl.json specify
		that foo/zote needs to load too, which would cause it to be loaded
		just before foo/bar unless it had already been loaded,
		manually or by another module.
		Problem: how to handle things if the dependency is loaded 
			but in a separate monolith?
			Maybe issue a warning if two separate monoliths both end up with
			a shared dependency that isn't already satisfied in
			yet a third monolith.
		Maybe also don't call them dependencies,
			since there won't be any version numbers and it refers to mojl
			modules (just a pathname to whatever is there),
			not node packages necessarily.
	
	*/

	// ### BEGIN LEGACY CONFIG ###
	
	// These three properties have been replaced by config.dir_mappings above.
	// Their default values produce the same results as the default value of
	// config.dir_mappings.

	// The directory to find the modules in, relative to `base`.
	// (The endpoint is also used as the basename for the build files.)
	"modules_dir": "modules",

	// The directory to build the monolithic files in, relative to `base`.
	"build_dir": "build",
	
	// The order in which the modules should be loaded.
	// `head` should contain the names of modules that should be loaded first,
	// in the order in which they should be loaded.
	// `tail` should contain the names of modules that should be loaded last,
	// in the order in which they should be loaded.
	// The rest of the modules are loaded alphabetically.
	"module_order": {
		"head": [],
		"tail": []
	}

	// ### END LEGACY CONFIG ###
};

/**
 * Each rewriter should accept these arguments, find the URLs in `code`,
 * replace each URL with the result of passing the URL to `rewrite`,
 * and return the resulting string.
 *
 * code: The code to do the rewrites on.
 * rewrite: The function, internal to mojl, that actually rewrites the url.
 */
const rewriters = {
	css: function (code, rewrite) {
		return rewriteCssUrls.findAndReplace(code, {
			replaceUrl: function (ref) {
				return rewrite(ref.url);
			}
		});
	}
};

/**
 * Settings for underscore templates of each file type.
 */
const template_settings = {
	// Use extended block comments as delimiters in JS templates, so that the
	// templates can be linted as long as the delimiter outputs function
	// arguments. JSLint will just see an empty argument list.
	js: {
		'interpolate': /\/\*\{\=((?:\n|\r|.)+?)\}\*\//g
	}
};

/**
 * Each commenter should accept the text of the comment to be written
 * and return the full comment. When writing a commenter, be sure to
 * prevent accidental closing of the comment.
 */
const commenters = {
	block: {
		open: '/*',
		fill: '*',
		close: '*/',
		filter: t => t.split('*/').join('*!/'),
	}
};

/**
 * Generate a function that creates comments in a particular format.
 */
function generate_commenter(options) {
	_.defaults(options, {
		// Commented options are required
		width: 72,
// 		open: '/*',
		fill: '#',
		close: '',
		pad: 2,
		filter: t => t,
	});
	
	if (typeof options.open !== 'string') {
		throw 'invalid comment open';
	}
	
	return function (text) {
		let open = options.open,
			close = options.close,
			
			// Length of comment minus the opening and closing delimiters
			len = options.width - open.length - close.length,
			
			// The spaces around the text
			spaces = ' '.repeat(options.pad),
			
			// Filter and pad the text
			content = spaces + options.filter(text) + spaces,
			
			// Create the fill
			bg = options.fill.repeat(len),
			
			// How many fill characters should come before and after the text
			half = Math.max(0, (len - content.length) / 2),
			bg_head = bg.substr(0, Math.ceil(half)),
			bg_tail = bg.substr(bg.length - Math.floor(half));
		
		// Enclose the comment in the delimiters
		return open + bg_head + content + bg_tail + close;
	};
}

/**
 * A for...in loop basically
 * Usage:
 * objEach(obj, (key, value) => {
 *   ...
 * });
 */
function objEach(obj, fn) {
	Object.keys(obj).forEach(key => {
		fn(key, obj[key]);
	});
}

/**
 * Write dev and production files based on the modules specified in config.
 */
function build(config) {
	let plan = simulate_build(config);
	objEach(plan, (filename, contents) => {
		fs.writeFileSync(filename, contents);
	});
	return plan;
}

/**
 * Build dev and production files based on the modules specified in config,
 * but don't really write anything to the filesystem.
 */
function simulate_build(config) {
	if (!config.base) {
		throw 'The `base` setting is required.';
	}
	
	// Work with a copy of the config object, in case it's used outside.
	config = _.cloneDeep(config);

	// If dir_mappings wasn't supplied but any or all legacy parts were,
	// then plan on generating the dir_mappings array from the legacy parts.
	let do_convert_legacy = !config.dir_mappings && (
			config.build_dir || config.modules_dir || config.module_order
		);

	// Superimpose the supplied config file over the defaults.
	_.defaultsDeep(config, config_defaults);

	// Generate the build map if that was the verdict above.
	if (do_convert_legacy) {
		convert_legacy(config);
	}
	
	// Expand wildcards in the module lists.
	expand_file_maps(config);
	
	// Build a plan for the files to build.
	let mods = build_module_objects(config);
	let cat = concatenate(mods, config);
	let plan = plan_files(cat, config);
	
	return plan;
}

/**
 * Convert the legacy "build_dir", "modules_dir", and "module_order" values
 * to the new "dir_mappings" config value.
 * This function modifies the config object.
 */
function convert_legacy(config) {
	let order = config.module_order || {},
		head = order.head || [],
		tail = order.tail || [];
	config.dir_mappings = [{
		build: path.join(config.build_dir, path.basename(config.modules_dir)),
		modules: head.concat(['*']).concat(tail).
			map(mod => path.join(config.modules_dir, mod))
	}];
	
	// Issue a warning about legacy parts being deprecated.
	// to-do: test this
// 	warn('The `build_dir`, `modules_dir`, and `module_order` configuration options are deprecated. Use `dir_mappings` instead.');

	// Delete the legacy properties to ensure that no other part of the code
	// is relying on them instead of using config.dir_mappings.
	delete config.build_dir;
	delete config.modules_dir;
	delete config.module_order;
}

/**
 * Expand module wild cards and modules required modules encountered.
 * This function modifies the config object.
 */
function expand_file_maps(config) {
	let all_mods = []; // An array to tally all the mods loaded so far.

	// Loop through the maps defined in config.
	config.dir_mappings.forEach(map => {
		// The expanded list of modules for this map.
		let exp_mods = [];
		
		// Loop through the modules in this map.
		expand_mod_array(config, all_mods, map.modules, exp_mods);

		// Replace the mapping's module list with the expanded one.
		map.modules = exp_mods;

		// Add the expanded modules to the running list of all modules in use.
		all_mods = all_mods.concat(exp_mods);
	});

	// Issue a warning if any of the modules just added
	// are already in another file mapping.
	// to-do: test this
// 	let dupes = all_mods.filter(
// 		(mod, index) => all_mods.indexOf(mod) !== index
// 	);
// 	if (dupes.length > 0) {
// 		warn('The following modules are loaded more than once: ' + dupes.join(', '));
// 	}
}

/**
 * Expand a single list of modules,
 * whether in a mapping or in a `require` array in a module's .mojl.json file.
 */
function expand_mod_array(config, all_mods, mods, exp_mods) {
	// Loop through the modules in this map.
	mods.forEach(mod_path => {
		// If it's a wildcard, expand it.
		if (path.basename(mod_path) === '*') {
			expand_wilds(config, all_mods, mods, exp_mods, mod_path);
		
		// Otherwise, load the specified module along with any other
		// modules it requires.
		} else {
			include_module(config, all_mods, mods, exp_mods, mod_path);
		}
	});
}

/**
 * Expand wildcard entries.
 */
function expand_wilds(config, all_mods, mods, exp_mods, mod_path) {
	let wilds = find_mods_in_dir(config, path.dirname(mod_path));
	wilds.forEach(wild => {
		// Omit any of the modules the wildcard expanded into
		// that are already explicitly referenced in map.modules.
		if (!mods.includes(wild)) {
			include_module(config, all_mods, mods, exp_mods, wild);
		}
	});
}

/**
 * Include a module and all its requirements.
 */
function include_module(config, all_mods, mods, exp_mods, mod_path) {
	// Don't include this module if it's already been included.
	if (all_mods.includes(mod_path)) {
		return;
	}

	// If the module has requirements, expand and include those first.
	expand_requires(config, all_mods, mods, exp_mods, mod_path);

	// Add it to the expanded list.
	exp_mods.push(mod_path);
}

/**
 * Expand a module's requirements from its .mojl.json file.
 */
function expand_requires(config, all_mods, mods, exp_mods, mod_path) {
	// If the module has a .mojl.json file...
	let full_mod_path = path.join(config.base, mod_path),
		endpoint = path.basename(full_mod_path),
		json_path = path.join(full_mod_path, endpoint + '.mojl.json');
	if (fs.existsSync(json_path)) {
		// ...and if that json file has a `require` array...
		let mojl_json = JSON.parse(fs.readFileSync(json_path, 'utf8')),
			req_mods = mojl_json.require;
		if (req_mods instanceof Array) {
			// ...then expand that array.
			
			// But first, required modules's paths can be relative to the
			// current module's own directory, using `./` or `../`.
			// Make them relative to config.base instead.
			req_mods = req_mods.map(req => {
				let s = path.sep;
				if (req.startsWith('.' + s) || req.startsWith('..' + s)) {
					req = path.normalize(path.join(full_mod_path, req));
					req = path.relative(config.base, req);
				}
				return req;
			});
			
			// Okay, NOW expand the array.
			expand_mod_array(config, all_mods, req_mods, exp_mods);
		}
	}
}

/**
 * Find all the modules at the root of the given directory.
 * Returns an array of paths.
 */
function find_mods_in_dir(config, parent_dir) {
	let mods = [],
		modules_dir = path.join(config.base, parent_dir);

	// Map all the modules.	
	if (fs.lstatSync(modules_dir).isDirectory()) {
		// Read the modules directory.
		(fs.readdirSync(modules_dir, {withFileTypes: true})

			// Only look at directories.
			.filter(ent => ent.isDirectory())

			// Add items to the mods array.
			.forEach(dir => {
				mods.push(path.join(parent_dir, dir.name));
			})
		);
	}

	return mods;
}

/**
 * Convert the module paths to objects describing the modules.
 * Returns an object like this:
 * {
 *   "build/modules": {
 *     "modules/nav": {
 *       "css": "nav.css",
 *       "html": "nav.html",
 *       "ie.css": "nav.ie.css",
 *       "ie.js": "nav.ie.js",
 *       "js": "nav.js"
 *     },
 *     "modules/shell": {
 *       "css": "shell.css",
 *       "html": "shell.html",
 *       "ie.css": "shell.ie.css",
 *       "ie.js": "shell.ie.js",
 *       "js": "shell.js"
 *     }
 *   }
 * }
 */
function build_module_objects(config) {
	let objs = {};
	
	config.dir_mappings.forEach(map => {
		let mods = {};
		map.modules.forEach(mod_path => {
			// Add a new object to represent the module.
			let thismod_dir = path.join(config.base, mod_path);
			mods[mod_path] = find_pieces(thismod_dir, path.basename(mod_path));
		});
		
		objs[map.build] = mods;
	});
	
	return objs;
}

/**
 * Find all the files in a directory whose names without extension
 * are the directory name.
 */
function find_pieces(thismod_dir, dirname) {
	let pieces = {},
		prefix = dirname + '.';

	// Read the files in the directory.
	(fs.readdirSync(thismod_dir, {withFileTypes: true})
		// Only the files.
		.filter(ent => ent.isFile())

		// Grab all the files that start with the prefix
		.forEach(file => {
			if (file.name.startsWith(prefix)) {
				let ext = file.name.substring(prefix.length);
				pieces[ext] = file.name;
			}
		})
	);

	return pieces;
}

/**
 * Concatenate the module files into the build files.
 */
function concatenate(monoliths, config) {
	let destinations = {};
	objEach(monoliths, (build_path, mods) => {
		let cats = {};

		// For each module, add on to the concatenated object,
		// which will get a property named for each file extension 
		objEach(mods, (mod_path, files) => {
			let base = path.join(config.base, mod_path);
	
			// For each type of file in the module...
			objEach(files, (ext, filename) => {
				let real_ext = ext.split('.').pop();
			
				// Verify that we should be concatenating this file type...
				if (config.file_types[real_ext]) {
					// Add the property to the concatenation object
					// if it doesn't already exist...
					let cat = cats[ext] = (cats[ext] || {
						real_ext: real_ext,
						manifest: [],
						contents: [],
					});
					
					// Add the path of this file's module
					// to the manifest for this concatenated file.
					cat.manifest.push(mod_path);
					
					// Add a comment naming this file's module
					// to this concatenated file.
					cat.contents.push(
						build_comment(config, mod_path, real_ext) || ''
					);
					
					// Rewrite any rewritable URLs in this file's content,
					// and add the resulting content to this concatenated file.
					cat.contents.push(
						rewrite_urls(config, base, filename, real_ext, build_path)
					);
				}
			});
		});

		// Add the concatenated files for this build group to the plan.
		destinations[build_path] = cats;
	});

	return destinations;
}

/**
 * Push a comment indicating the module the content came from
 */
function build_comment(config, mod_path, real_ext) {
	let commenter = config.file_types[real_ext].comment;
	if (commenter) {
		if (typeof commenter === 'string') {
			commenter = commenters[commenter];
		}
		if (typeof commenter === 'object') {
			commenter = generate_commenter(commenter);
		}
		if (typeof commenter !== 'function') {
			throw 'invalid commenter';
		}
		return commenter(mod_path);
	}
}

/**
 * Rewrite URLs to work from the directory the concatenated file will be in
 * instead of the directory the original file is in.
 */
function rewrite_urls(config, base, filename, real_ext, build_path) {
	// Read the source file...
	let dest_dirname = path.join(config.base, path.dirname(build_path)),
		file_path = path.join(base, filename),
		content = fs.readFileSync(file_path, {encoding: 'utf8'}),
		rewriter = config.file_types[real_ext].rewrite;

	// Rewrite urls
	if (rewriter) {
		if (typeof rewriter === 'string') {
			rewriter = rewriters[rewriter];
		}
		if (typeof rewriter !== 'function') {
			throw 'invalid rewriter';
		}

		let src_dir = path.dirname(file_path),
			rewrite_fn = function (url) {
				// Don't rewrite absolute urls
				if (/^(\/|[-+.a-z]+:)/i.test(url.trim())) {
					return url;
				}

				// Where is this file really?
				let asset_path = path.join(src_dir, url);

				// Return a timestamped relative path from the destination
				// directory to the url's location in the source directory.
				return path.relative(dest_dirname, asset_path) +
					timestamp(asset_path);
			};

		content = rewriter(content, rewrite_fn);
	}

	// Push the content onto the contents array
	// and the module path onto the manifest.
	return content;
}

/**
 * Get a timestamp URL query to append to asset URLs.
 */
function timestamp(path) {
	let stamp = fs.existsSync(path) ?
		new Date(fs.statSync(path).mtime).getTime() :
		'not-found';
	return '?t=' + stamp;
}

/**
 * Build a list of files that will hold the concatenated contents
 * from the files in all the modules.
 */
function plan_files(cat_dests, config) {
	let plan = {};
	
	objEach(cat_dests, (dest_key, cat) => {
	
		objEach(cat, (ext, monolith) => {
			let filename = path.join(
					config.base, dest_key + '.' + ext
				),
				contents = monolith.contents.join('\n\n'),
				real_ext = monolith.real_ext,
			
				tpl_dev_file = 'dev-' + real_ext + '.tpl',
				tpl_dev_path = path.join(__dirname, tpl_dev_file),
				tpl_dev_exists = fs.existsSync(tpl_dev_path);

			plan[filename] = contents;
		
			if (tpl_dev_exists) {
				let tpl_dev = fs.readFileSync(tpl_dev_path, {encoding: 'utf8'}),
					filename_dev = path.join(
						config.base, dest_key + '-dev.' + ext
					),
					dev_urls = monolith.manifest.map(name => {
						let asset = path.join(
							config.base, name, path.basename(name) + '.' + ext
						);
						return path.relative(
							path.dirname(filename_dev),
							asset
						) + timestamp(asset);
					}),
				
					// Choose template settings based on real extension.
					tpl_settings =
						template_settings.hasOwnProperty(real_ext) ?
							template_settings[real_ext] : null,

					// Compile and use underscore template.
					contents_dev = tpl_dev ?
						_.template(tpl_dev, tpl_settings)({dev_urls}) :
						'';

				plan[filename_dev] = contents_dev;
			}
		
		});

	});

	return plan;
}

/**
 * Issue and/or stash a warning.
 */
// function warn(msg) {
// 	msg = 'WARNING: ' + msg;
// 	warnings.push(msg);
// 	if (!mojl.suppress_warnings) {
// 		return console.warn(msg);
// 	}
// }

/**
 * Get stashed warnings.
 */
function get_warnings() {
	// to-do: test this.
	// Turn off mojl.warn for tests, then read the stashed warnings.
	return _.clone(warnings);
}

/**
 * Stuff to make public.
 */
const mojl = {
	suppress_warnings: false,
	debug: false,
	build,
	simulate_build,
	get_warnings,
	commenters,
	rewriters,
};

/**
 * A debugging function that only sends output when mojl.debug is truthy.
 * It's set up this way so that inside a test, you can set mojl.debug to true,
 * do stuff that calls this debug function, then set it back to false. That way
 * the debug function only does things for the test you're debugging.
 */
function debug() {
	if (mojl.debug) {
		return console.log(...arguments);
	}
}

/**
 * Calling it here doesn't do anything, because mojl.debug is false,
 * but we need to appease jshint in case it's not called anywhere else.
 */
debug();


// Export the public stuff.
module.exports = mojl;
