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
const glob = require('glob');
const rewriteCssUrls = require('rewrite-css-urls');

/**
 * Default configuration options
 */
const config_defaults = {
	/**
	 * The absolute path to the base directory for everything mojl does.
	 * Required.
	 */
	"base": "",

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
	 * The directory to find the modules in, relative to `config.base`.
	 */
	"modules_dir": "modules",

	/**
	 * The directory to build into, relative to `config.base`.
	 */
	"build_dir": "build",
	
	/**
	 * String or boolean.
	 * 
	 * If a string, it is used as a directory name relative to `build_dir`,
	 * into which the modules will be copied. Only the modules included in the
	 * build will be copied, and the directory structure will be preserved.
	 *
	 * If `true`, the value of `config.modules_dir` will be used.
	 *
	 * If `false`, no mirroring will occur.
	 */
	"mirror_dir": false,
	
	/**
     * A glob describing which files in each module to mirror.
     * Relative to each module's main directory individually.
     */
	"mirror_glob": "**",
	
	/**
	 * An array of strings to use as regular expression for refining the
	 * results of mirror_glob.
	 */
	"mirror_exclude": [],
	
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
	 *   The path to where the concatenated files will be saved,
	 *   relative to `config.build_dir`.
	 *   The endpoint of this path is not a directory, but the prefix
	 *   of each concatenated file.
	 *
	 *   For example, "build": "foo/modules" might create files named:
	 *     {config.base}/{config.build_dir}/foo/modules-dev.css
	 *     {config.base}/{config.build_dir}/foo/modules-dev.js
	 *     {config.base}/{config.build_dir}/foo/modules.css
	 *     {config.base}/{config.build_dir}/foo/modules.js
	 *
	 * > "modules" (array of strings)
	 *
	 *   Each string in this array refers to the path to a module,
	 *   or a wildcard to load all modules in a certain directory (or any glob)
	 *   in alphabetical order.
	 *
	 *   For example:
	 *     "nav" loads the "nav" module inside {config.base}/{config.modules_dir}/
	 *     "*" loads ALL modules inside {config.base}/{config.modules_dir}/
	 *     "foo/nav" loads the "nav" module inside {config.base}/{config.modules_dir}/foo/
	 *     "foo/*" loads ALL modules inside {config.base}/{config.modules_dir}/foo/
	 *
	 *   If a wildcard is listed in the same array as an explicit reference
	 *   to a module matched by the wildcard, the item retains its position
	 *   instead of expanding from the wildcard into a duplicate listing.
	 *
	 *   For example, if ["foo/*"] expands to:
	 *     ["foo/contact", "foo/foot", "foo/nav", "foo/shell"]
	 *
	 *   Then ["foo/shell", "foo/*", "foo/foot"] expands to:
	 *     ["foo/shell", "foo/contact", "foo/nav", "foo/foot"]
	 */
	"dir_mappings": [
		{
			"build": "modules",
			"modules": [
				"*"
			]
		}
	],
	
	/**
	 * An array of modules already loaded externally, not to be included in
	 * any concatenated file.
	 */
	"external_modules": [],
	
	/**
	 * By default, warnings will be sent to the console (true).
	 * To suppress warnings, assign false to this value.
	 * To send warnings somewhere other than console.warn,
	 * assign a different function here.
	 */
	"warn": true,


	// ### BEGIN LEGACY CONFIG ###
	
	// This property has been replaced by config.dir_mappings above.
	// Its default value produces the same result as the default value of
	// config.dir_mappings.

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
	

	// An object for tacking on calculated properties that won't change.
	// "x": {
	//   "modules_base": {config.base}/{config.modules_dir},
	//   "build_base": {config.base}/{config.build_dir},
	// }
};

/**
 * Warnings that could get issued.
 */
const warnings = {
	"MODULE_ORDER_DEPRECATED": "config.module_order is deprecated and may not be available in future versions. Use config.dir_mappings instead."
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
 * Wrap a configuration option in an array if it isn't already one.
 */
function array_wrap(config, option) {
	if (!(config[option] instanceof Array)) {
		config[option] = [config[option]];
	}
	return config[option];
}

/**
 * Write dev and production files based on the modules specified in config.
 */
function build(config) {
	let plan = simulate_build(config);
	objEach(plan, (filename, contents) => {
		switch (typeof contents) {
			case 'string':
				fs.writeFileSync(filename, contents);
			break;
			case 'object':
				if (contents && contents.hasOwnProperty('source')) {
					fs.mkdirSync(path.dirname(filename), { recursive: true });
					fs.copyFileSync(contents.source, filename);
				}
			break;
		}
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
	
	// Most configuration defaults will be copied below using _.defaultsDeep,
	// but the `warn` option needs to be present before potentially warning
	// about module_order.
	if (!config.hasOwnProperty('warn')) {
		config.warn = config_defaults.warn;
	}

	// Check for deprecated configurations.
	if (config.module_order) {
		warn(config, 'MODULE_ORDER_DEPRECATED');
	}

	// If dir_mappings wasn't supplied but any or all legacy parts were,
	// then plan on generating the dir_mappings array from the legacy parts.
	let do_convert_legacy = !config.dir_mappings && (
			// build_dir isn't needed for creating a mappings array.
			config.modules_dir || config.module_order
		);

	// Superimpose the supplied config file over the defaults.
	_.defaultsDeep(config, config_defaults);
	
	// Mirroring: true -> modules_dir
	if (config.mirror_dir === true) {
		config.mirror_dir = config.modules_dir;
	}

	// Extend the copy of the config object with derived properties
	// that won't change.
	config.x = {
		"modules_base": path.join(config.base, config.modules_dir),
		"build_base": path.join(config.base, config.build_dir),
	};

	// Generate the build map if that was the verdict above.
	if (do_convert_legacy) {
		convert_legacy(config);
	}
	
	// Ensure array configs are arrays.
	array_wrap(config, 'dir_mappings');
	array_wrap(config, 'external_modules');
	array_wrap(config, 'mirror_exclude');

	// Expand wildcards in the module lists.
	expand_file_maps(config);
// 	console.log('----config----', JSON.stringify(config, null, 2));

	// Build a list of files to mirror.
	let mirror = plan_mirror(config);
// 	if (Object.keys(mirror).length > 0) {
// 		console.log('----mirror----', JSON.stringify(mirror, null, 2));
// 	}

	// Build a plan for the files to build.
	let mods = build_module_objects(config);
// 	console.log('----mods----', JSON.stringify(mods, null, 2));

	let cat = concatenate(config, mods);
// 	console.log('----cat----', JSON.stringify(cat, null, 2));

	let plan = plan_files(config, cat, mirror);
// 	console.log('----plan----', JSON.stringify(plan, null, 2));
	
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
		build: path.basename(config.modules_dir),
		modules: head.concat(['*']).concat(tail)
	}];
	
	// Delete the legacy properties to ensure that no other part of the code
	// is relying on them instead of using config.dir_mappings.
	delete config.module_order;
}

/**
 * Expand module wild cards and modules required modules encountered.
 * This function modifies the config object.
 */
function expand_file_maps(config) {
	// An array to tally all the mods loaded so far.
	// Start with a copy of the externally-loaded modules.
	let all_mods = _.clone(config.external_modules);

	// Loop through the maps defined in config.
	config.dir_mappings.forEach(map => {
		// The expanded list of modules for this map.
		let exp_mods = [];
		
		// Loop through the modules in this map.
		expand_mod_array(config, all_mods, map.modules, exp_mods);

		// Replace the mapping's module list with the expanded one.
		map.modules = exp_mods;
	});

}

/**
 * Expand a single list of modules,
 * whether in a mapping or in a `require` array in a module's .mojl.json file.
 */
function expand_mod_array(config, all_mods, mods, exp_mods) {
	let cwd = config.x.modules_base;
	
	// Loop through the modules in this map.
	mods.forEach(mod_path => {
	
		// Expand any glob characters
		let globbed_mods = glob.sync(mod_path, { cwd });
		
		// Check each result in the glob for inclusion in the expanded array.
		globbed_mods.forEach(globbed_mod => {
	
			// If the globbed_mod is not a directory, it's not a module.
			if (!fs.lstatSync(path.join(cwd, globbed_mod)).isDirectory()) {
				return;
			}

			// Two conditions under which it should be included:
			if (
				// If it's the current item in the array we're expanding,
				// which means the item was actually just a regular path and
				// not really a glob after all...
				mod_path === globbed_mod ||
				
				// Or -- if it was part of a real glob result -- include it if
				// it's not already somewhere else in the list we're expanding.
				!mods.includes(globbed_mod)
			) {
				include_module(config, all_mods, mods, exp_mods, globbed_mod);
			}
		});

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

	// Add the module to the running list of all modules included so far.
	// It needs to be added here before calling `expand_requires` again,
	// in order to stop infinite recursion.
	// The order of all_mods doesn't matter.
	// Only the order of exp_mods matters.
	all_mods.push(mod_path);

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
	let full_mod_path = path.join(config.x.modules_base, mod_path),
		endpoint = path.basename(full_mod_path),
		json_path = path.join(full_mod_path, endpoint + '.mojl.json');
	if (fs.existsSync(json_path)) {
		// ...and if that json file has a `require` value...
		let mojl_json = JSON.parse(fs.readFileSync(json_path, 'utf8'));
		if (mojl_json.require) {
			// ...then make sure it's an array...
			array_wrap(mojl_json, 'require');
			
			// ...rewrite any `./` or `../` paths to make them relative to
			// config.x.modules_base instead of to the current module's own
			// directory...
			let req_mods = mojl_json.require;
			req_mods = req_mods.map(req => {
				let s = path.sep;
				if (req.startsWith('.' + s) || req.startsWith('..' + s)) {
					req = path.normalize(path.join(full_mod_path, req));
					req = path.relative(config.x.modules_base, req);
				}
				return req;
			});
			
			// ...and expand the array into real paths.
			expand_mod_array(config, all_mods, req_mods, exp_mods);
		}
	}
}

/**
 * Plan which files to mirror and where.
 */
function plan_mirror(config) {
	let mirror = {};
	if (config.mirror_dir) {
		let mirbase = path.join(config.x.build_base, config.mirror_dir),
			modbase = config.x.modules_base;
		config.dir_mappings.forEach(mapping => {
			mapping.modules.forEach(module_dir => {
				let files = glob.sync(path.join(module_dir, config.mirror_glob), {
					cwd: modbase
				});
				files.forEach(file => {
					let filepath = path.join(modbase, file);
					
					// Skip files that...
					if (
						// are not files
						!fs.lstatSync(filepath).isFile() ||
						
						// are excluded by a pattern
						config.mirror_exclude.some(
							pattern => new RegExp(pattern).test(file)
						)
					) {
						return;
					}

					mirror[path.join(mirbase, file)] = {
						"source": filepath
					};
				});
			});
		});
	}
	return mirror;
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
			let thismod_dir = path.join(config.x.modules_base, mod_path);
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
function concatenate(config, monoliths) {
	let destinations = {};
	objEach(monoliths, (catfile_prefix, mods) => {
		let cats = {};

		// For each module, add on to the concatenated object,
		// which will get a property named for each file extension 
		objEach(mods, (mod_path, files) => {
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
					cat.contents.push(rewrite_urls(
						config, mod_path, filename, real_ext, catfile_prefix
					));
				}
			});
		});

		// Add the concatenated files for this build group to the plan.
		destinations[catfile_prefix] = cats;
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
function rewrite_urls(config, mod_path, filename, real_ext, catfile_prefix) {
// 	console.log('rewriting urls in ' + filename);
//  	console.log('config: ' + JSON.stringify(config, null, 2));
	
	// The parent directory of the file that will contain
	// the concatenated content.
	let catfile_parent = path.join(
			config.x.build_base,
			path.dirname(catfile_prefix)
		);
	
	// The parent directory of the file from which the content is being read.
	let orig_parent = path.join(config.x.modules_base, mod_path);

	// The file from which the content is being read.
	let orig = path.join(orig_parent, filename);

	// The directory to which the rewritten URLs will be considered relative
	// prior to rewriting; either the parent of the original, or the parent of
	// the mirror if it exists.
	let rewrite_parent = config.mirror_dir ?
			path.join(config.x.build_base, config.mirror_dir, mod_path) :
			orig_parent;

	// Read the source file...
	let content = fs.readFileSync(orig, {encoding: 'utf8'});

	// Rewrite urls
	let rewriter = config.file_types[real_ext].rewrite;
	if (rewriter) {
		if (typeof rewriter === 'string') {
			rewriter = rewriters[rewriter];
		}
		if (typeof rewriter !== 'function') {
			throw 'invalid rewriter';
		}
		content = rewriter(content, url => {
			// Don't rewrite absolute urls
			if (/^(\/|[-+.a-z]+:)/i.test(url.trim())) {
				return url;
			}
			
			// The timestamp of the original file -- not the mirror --
			// whose URL is being rewritten.
			let stamp = timestamp(path.join(orig_parent, url));

			// The path of the ultimate location of the file -- the mirror
			// if it exists, otherwise the original.
			let asset_path = path.join(rewrite_parent, url);
			
			// Return a timestamped relative path from the destination
			// directory to the url's location in the source directory.
			let rewritten = path.relative(catfile_parent, asset_path) + stamp;

			return rewritten;
		});
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
function plan_files(config, cat_dests, mirror) {
	let plan = _.cloneDeep(mirror);
	
	objEach(cat_dests, (dest_key, cat) => {
	
		objEach(cat, (ext, monolith) => {
			let filename = path.join(
					config.x.build_base, dest_key + '.' + ext
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
						config.x.build_base, dest_key + '-dev.' + ext
					),
					dev_urls = monolith.manifest.map(name => {
						let asset_orig = path.join(
								config.x.modules_base,
								name,
								path.basename(name) + '.' + ext
							),
							asset_mirror = config.mirror_dir ? path.join(
								config.x.build_base,
								config.mirror_dir,
								name,
								path.basename(name) + '.' + ext
							) : null;
						return path.relative(
							path.dirname(filename_dev),
							asset_mirror || asset_orig
						) + timestamp(asset_orig);
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
 * Issue a warning.
 */
function warn(config, key) {
	// Put the warning's key in brackets so the tests can parse it out.
	var msg = 'WARNING: [' + key + '] mojl: ' + warnings[key];

	var w = config.warn;
	if (w === true) {
		console.warn(msg);
	} else if (w instanceof Function) {
		w(msg);
	} else if (w !== false) {
		throw 'config.warn is neither true, false, nor a function';
	}
}

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
