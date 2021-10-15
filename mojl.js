/*!
 * mojl v1.0.2
 *
 * A node module to allow "content modules" with related assets grouped
 * together during development, and concatenate each file type from all the
 * modules into single monolithic .js, .css, etc. files.
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */

/*global require, module, __dirname, console */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const rewriteCssUrls = require('rewrite-css-urls');

/**
 * Default configuration options
 */
const config_defaults = {
	// The base directory for everything mojl does.
	// Required. (Don't uncomment)
// 	"base": "./web/wp-content/themes/your-theme",

	// The directory to find the modules in, relative to `base`.
	// (The endpoint is also used as the basename for the build files.)
	"modules_dir": "modules",

	// The directory to build the monolithic files in, relative to `base`.
	"build_dir": "build",
	
	// Describe how to handle files of each type.
	"file_types": {
		"css": {
			"comment": "block",
			"rewrite": "css"
		},
		"js": {
			"comment": "block"
		}
	},
	
	// The order in which the modules should be loaded.
	// `head` should contain the names of modules that should be loaded first,
	// in the order in which they should be loaded.
	// `tail` should contain the names of modules that should be loaded last,
	// in the order in which they should be loaded.
	// The rest of the modules are loaded alphabetically.
	"module_order": {
		"head": [],
		"tail": []
	},
	
	// to-do (in progress)
	/*
	An object describing which modules get built into which concatenated files.
	
	Each key in config.file_maps is a destination directory. The endpoint
	becomes the base name of the files generated inside that directory.

	The value for that key is an array of paths to modules. Each of those 
	module's files get copied into the files in the destination directory.
	
	to-do: (NOW) change dev-js.tpl so that multiple instances load in series
		instead of in parallel. Currently multiple dev scripts will cause their
		source scripts to load out of order.
	
	to-do: (NOW) Change program logic to use config.file_maps
		instead of the three legacy properties.
	
	to-do: (LATER) let modules require other modules
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
	"file_maps": [
		{
			"build": "build/modules",
			// Creates files named:
			// {config.base}/build/modules-dev.css
			// {config.base}/build/modules-dev.js
			// {config.base}/build/modules.css
			// {config.base}/build/modules.js
			
			"modules": [
				"modules/*"
				// Uses all modules inside {config.base}/modules/
				// This "*" wildcard can be omitted or used in conjunction with
				// specific modules before and after. Multiple wildcards from 
				// multiple directories can be used too.
			]
		}
	]

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
 * Write dev and production files based on the modules specified in config.
 */
function build(config) {
	let plan = simulate_build(config);
	Object.keys(plan).forEach(filename => {
		fs.writeFileSync(filename, plan[filename]);
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

	// If file_maps wasn't supplied but any or all legacy parts were,
	// then plan on generating the file_maps array from the legacy parts.
	let do_convert_legacy = !config.file_maps && (
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
	
	// New Way
	let mods_new = build_module_objects(config);
	let cat_new = concatenate_new(mods_new, config);
	let plan_new = plan_files_new(cat_new, config);
	
	// Old Way
	let mods = find_mods(config);
	let cat = concatenate(mods, config);
	let plan = plan_files(cat, config);

	console.log('\n===== plan =====');
	console.log(JSON.stringify(plan, null, 4));

	console.log('\n----- plan_new -----');
	console.log(JSON.stringify(plan_new, null, 4));

	return plan;
}

/**
 * Convert the legacy "build_dir", "modules_dir", and "module_order" values
 * to the new "file_maps" config value.
 * This function modifies the config object.
 */
function convert_legacy(config) {
	let order = config.module_order || {},
		head = order.head || [],
		tail = order.tail || [];
	config.file_maps = [{
		build: path.join(config.build_dir, path.basename(config.modules_dir)),
		modules: head.concat(['*']).concat(tail).
			map(mod => path.join(config.modules_dir, mod))
	}];
	
	// to-do:
	// Issue a warning about legacy parts being deprecated.

	// Delete the legacy properties to ensure that no other part of the code
	// is relying on them instead of using config.file_maps.
	//
	// to-do:
	// Uncomment these lines:
	//
	// delete config.build_dir;
	// delete config.modules_dir;
	// delete config.module_order;
}

/**
 * Expand module wild cards in file maps.
 * This function modifies the config object.
 */
function expand_file_maps(config) {
	let all_mods = []; // An array to tally all the mods loaded so far.

	// Loop through the maps defined in config.
	config.file_maps.forEach(map => {
		let expanded_mods = []; // The expanded list of modules for this map.
		
		// Loop through the modules in this map.
		map.modules.forEach(mod_path => {
			// If it's a wildcard, find all the modules in that directory.
			if (path.basename(mod_path) === '*') {
				let wilds = find_mods_in_dir(config, path.dirname(mod_path));
				wilds.forEach(wild => {
					// Omit any of the modules the wildcard expanded into
					// that are already explicitly referenced in map.modules.
					if (!map.modules.includes(wild)) {
						expanded_mods.push(wild);
					}
				});
			} else {
				// It's not a wildcard so just add it to the expanded list.
				expanded_mods.push(mod_path);
			}
		});

		// Issue a warning if any of the modules just added
		// are already in another file mapping.
		if (expanded_mods.some(item => all_mods.includes(item))) {
			// to-do
			console.log('warning about modules already being in use');
		}
		
		// Replace the mapping's module list with the expanded one.
		map.modules = expanded_mods;

		// Add the expanded modules to the running list of all modules in use.
		all_mods = all_mods.concat(expanded_mods);
	});
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
	
	config.file_maps.forEach(map => {
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

// Find all the modules.
function find_mods(config) {
	let mods = {},
		modules_dir = path.join(config.base, config.modules_dir);

	// Map all the modules.	
	if (fs.lstatSync(modules_dir).isDirectory()) {
		// Read the modules directory.
		(fs.readdirSync(modules_dir, {withFileTypes: true})

			// Only look at directories.
			.filter(ent => ent.isDirectory())

			// Add items to the mods object.
			.forEach(dir => {
				// Add a new object to represent the module.
				let thismod_dir = path.join(modules_dir, dir.name);
				mods[dir.name] = {
					base: thismod_dir,
					files: find_pieces(thismod_dir, dir.name),
				};
			})
		);
	}

	return mods;
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

// 
function concatenate(mods, config) {
	let cat = {},
		dest_dir = path.join(config.base, config.build_dir),
		names = get_order(mods, config);

	// For each module, add on to the concatenated object,
	// which will get a property named for each file extension 
	names.forEach(key => {
		let mod = mods[key],
			base = mod.base,
			files = mod.files;
	
		// For each type of file in the module...
		Object.keys(files).forEach(ext => {
			let real_ext = ext.split('.').pop();
			
			// Verify that we should be concatenating this file type...
			if (config.file_types[real_ext]) {
				// Add the property to the concatenation object
				// if it doesn't already exist...
				if (!cat[ext]) {
					cat[ext] = {
						real_ext: real_ext,
						manifest: [],
						files: [],
					};
				}
			
				// Read the source file...
				let file_path = path.join(base, files[ext]),
					content = fs.readFileSync(file_path, {encoding: 'utf8'}),
					rewriter = config.file_types[real_ext].rewrite,
					commenter = config.file_types[real_ext].comment;
				
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

							// Return a timestamped relative path from the destination directory
							// to the url's location in the source directory.
							return path.relative(dest_dir, asset_path) +
								timestamp(asset_path);
						};
					
					content = rewriter(content, rewrite_fn);
				}
			
				// Push a comment indicating the module the content came from
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
					cat[ext].files.push(commenter(key));
				}

				// Push the content onto the files array
				// and the key onto the manifest.
				cat[ext].files.push(content);
				cat[ext].manifest.push(key);
			}
		});
	});

	return cat;
}

/**
 * Concatenate the module files into the build files.
 */
function concatenate_new(mod_groups, config) {
	let destinations = {};
	Object.keys(mod_groups).forEach(build_path => {
	
		let cat = {},
			mods = mod_groups[build_path],
			dest_dirname = path.join(config.base, path.dirname(build_path));

		// For each module, add on to the concatenated object,
		// which will get a property named for each file extension 
		Object.keys(mods).forEach(key => {
			let base = path.join(config.base, key),
				files = mods[key];
	
			// For each type of file in the module...
			Object.keys(files).forEach(ext => {
				let real_ext = ext.split('.').pop();
			
				// Verify that we should be concatenating this file type...
				if (config.file_types[real_ext]) {
					// Add the property to the concatenation object
					// if it doesn't already exist...
					if (!cat[ext]) {
						cat[ext] = {
							real_ext: real_ext,
							manifest: [],
							contents: [],
						};
					}
			
					// Read the source file...
					let file_path = path.join(base, files[ext]),
						content = fs.readFileSync(file_path, {encoding: 'utf8'}),
						rewriter = config.file_types[real_ext].rewrite,
						commenter = config.file_types[real_ext].comment;
				
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

								// Return a timestamped relative path from the destination directory
								// to the url's location in the source directory.
								return path.relative(dest_dirname, asset_path) +
									timestamp(asset_path);
							};
					
						content = rewriter(content, rewrite_fn);
					}
			
					// Push a comment indicating the module the content came from
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
						cat[ext].contents.push(commenter(key));
					}

					// Push the content onto the contents array
					// and the key onto the manifest.
					cat[ext].contents.push(content);
					cat[ext].manifest.push(key);
				}
			});
		});

		destinations[build_path] = cat;
	});

	return destinations;
}

// Get the order of the modules using the config object.
function get_order(mods, config) {
	let order = config.module_order,
		mods_copy = {...mods},
		head = [],
		tail = [];

	order.head.forEach(name => {
		head.push(name);
		delete mods_copy[name];
	});

	order.tail.forEach(name => {
		tail.push(name);
		delete mods_copy[name];
	});

	return [...head, ...Object.keys(mods_copy), ...tail];
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

// Build a list of files that will hold the concatenated contents
// from the files in all the modules.
function plan_files(cat, config) {
	let plan = {},
		basename = path.basename(config.modules_dir);
	Object.keys(cat).forEach(ext => {
		let filename = path.join(
				config.base, config.build_dir, basename + '.' + ext
			),
			contents = cat[ext].files.join('\n\n'),
			
			tpl_dev_file = 'dev-' + cat[ext].real_ext + '.tpl',
			tpl_dev_path = path.join(__dirname, tpl_dev_file),
			tpl_dev_exists = fs.existsSync(tpl_dev_path);

		plan[filename] = contents;
		
		if (tpl_dev_exists) {
			let tpl_dev = fs.readFileSync(tpl_dev_path, {encoding: 'utf8'}),
				filename_dev = path.join(
					config.base, config.build_dir, basename + '-dev.' + ext
				),
				urls_dev = cat[ext].manifest.map(name => {
					let asset = path.join(
						config.base, config.modules_dir, name, name + '.' + ext
					);
					return path.relative(
						path.dirname(filename_dev),
						asset
					) + timestamp(asset);
				}),
				
				// Some quick-n-dirty templating.
				contents_dev = tpl_dev ? tpl_dev.replace(
					'/*{urls}*/', // <-- not a regex
					() => JSON.stringify(urls_dev)
				) : '';
			plan[filename_dev] = contents_dev;
		}
		
	});
	return plan;
}

/**
 * Build a list of files that will hold the concatenated contents
 * from the files in all the modules.
 */
function plan_files_new(cat_dests, config) {
	let plan = {};
	
	Object.keys(cat_dests).forEach(dest_key => {
		let cat = cat_dests[dest_key];
	
		Object.keys(cat).forEach(ext => {
			let filename = path.join(
					config.base, dest_key + '.' + ext
				),
				contents = cat[ext].contents.join('\n\n'),
			
				tpl_dev_file = 'dev-' + cat[ext].real_ext + '.tpl',
				tpl_dev_path = path.join(__dirname, tpl_dev_file),
				tpl_dev_exists = fs.existsSync(tpl_dev_path);

			plan[filename] = contents;
		
			if (tpl_dev_exists) {
				let tpl_dev = fs.readFileSync(tpl_dev_path, {encoding: 'utf8'}),
					filename_dev = path.join(
						config.base, dest_key + '-dev.' + ext
					),
					urls_dev = cat[ext].manifest.map(name => {
						let asset = path.join(
							config.base, name, path.basename(name) + '.' + ext
						);
						return path.relative(
							path.dirname(filename_dev),
							asset
						) + timestamp(asset);
					}),
				
					// Some quick-n-dirty templating.
					contents_dev = tpl_dev ? tpl_dev.replace(
						'/*{urls}*/', // <-- not a regex
						() => JSON.stringify(urls_dev)
					) : '';
				plan[filename_dev] = contents_dev;
			}
		
		});

	});

	return plan;
}

/**
 * Stuff to make public.
 */
const mojl = {
	debug: false,
	build,
	simulate_build,
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
		return console.log.apply(console, arguments);
	}
}

/**
 * Calling it here doesn't do anything, because mojl.debug is false,
 * but we need to appease jshint in case it's not called anywhere else.
 */
debug();

// Export the public stuff.
module.exports = mojl;
