/*!
 * mojl v1.0.3-dev
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
const shell = require('shelljs');
const rewriteCssUrls = require('rewrite-css-urls');


// Default configuration options
const config_defaults = {
	// The base directory for everything mojl does.
	// Required. (Don't uncomment)
// 	"base": "./web/wp-content/themes/your-theme",

	// Whether to build files for a development instance.
	// to-do
	"dev": true,
	
	// Whether to build files for a production or staging instance.
	// to-do
	"prod": true,

	// The directory to find the modules in, relative to `base`.
	// (The endpoint is also used as the basename for the build files.)
	//
	// to-do:
	// Let this optionally be an array, with multiple directories
	// to look for modules inside of.
	// Since this is to allow modules to be added via npm, there needs to be
	// some way of differentiating them from other npm packages.
	// Therefore, when `modules_dir` is an array, only modules with an 
	// `<endpoint>.mojl.json` file should be seen as modules.
	//
	"modules_dir": "modules",

	// This value serves as the default value for `assets_build_dir` and
	// `site_build_dir`.
	"build_dir": "build",
	
	// The directory to build monolithic js and css files into,
	// relative to `base`.
	"assets_build_dir": "build",
	
	// The directory to build html pages from lodash templates into,
	// relative to `base`.
	// to-do
	"site_build_dir": "build",
	
	// The directory to copy module files into.
	// - If empty, module files are not copied.
	// - If `dev` is false, the copy excludes endpoint files,
	//   except those listed in `module_files_whitelist`.
	// - Always excludes `package.json`.
	// to-do
	"module_files_dir": "",
	
	// An array of filenames (or regular expressions) in each module
	// to include in the build copy.
	// to-do
	"module_files_whitelist": [
		// "package.json"            // Literal string filename
		// /\.html\.php$/i           // Regex matching file names
		// ["\\.html\\.php$", "i"]   // Same regex as an array of strings
	],

	// An array of filenames (or regular expressions) in each module
	// to exclude from the build copy.
	// to-do
	"module_files_blacklist": [
		// see comments above in `module_files_whitelist`
	],

	// The module that becomes the home page of the site.
	// Other pages are modules within this one.
	// If empty, no html pages are built.
	// to-do
	"html_root_module": "",

	// The filename to use as the "index" in each directory to allow pretty urls.
	// e.g. /about/index.html => /about/
	// to-do
	"index_filename": "index.html",
	
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
	}
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

// Just for fun, optionally center the name of the component
// in a long banner comment.
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

// Really write the files from simulate_build.
function build(config) {
	let plan = simulate_build(config);
	Object.keys(plan).forEach(filename => {
		// Prevent writing outside `config.base`.
		if (!filename.startsWith(config.base + '/')) {
			throw `Path "${filename}" is outside base directory "${config.base}"`;
		}

		// Create any intermediate directories that don't exist yet.
		shell.mkdir('-p', path.dirname(filename));

		// Write the file.
		fs.writeFileSync(filename, plan[filename]);
	});
	return plan;
}

// Build dev and production files based on a directory of modules.
function simulate_build(config) {

	// Use the value of `build_dir` as the default value
	// for `assets_build_dir` and `site_build_dir`.
	if (config.hasOwnProperty('build_dir')) {
		if (!config.hasOwnProperty('assets_build_dir')) {
			config.assets_build_dir = config.build_dir;
		}
		if (!config.hasOwnProperty('site_build_dir')) {
			config.site_build_dir = config.build_dir;
		}
	}

	// Superimpose the supplied config file over the defaults.
	_.defaultsDeep(config, config_defaults);

	// Wrap the modules directory in an object if not already as such.
	// The object should be in the form:
	// {
	//   "destination_filename": [ // without extension
	//     "path/to/one/modules_dir",
	//     "path/to/another/modules_dir",
	//     "paths/to/even/more/directories"
	//   ]
	// }
	if (
		!config.modules_dir ||
		('object' !== typeof config.modules_dir)
	) {
		let dir = config.modules_dir;
		config.modules_dir = {};
		config.modules_dir[path.basename(dir)] = [dir];
	}

	if (!config.base) {
		throw 'The `base` setting is required.';
	}

	let dests = find_mods_dests(config),
		cat_dests = concatenate(dests, config),
		plan = plan_files(cat_dests, config);
	
	return plan;
}

// Find all the modules and their destinations.
/*
{
  "modules-combined": {
	"shell": [
	  {
		"base": "/Users/thomas/Projects/Node/mojl/test/multiple-module-dirs/modules-a/shell",
		"files": {
		  "css": "shell.css",
		  "html.tpl": "shell.html.tpl"
		}
	  },
	  {
		"base": "/Users/thomas/Projects/Node/mojl/test/multiple-module-dirs/modules-b/shell",
		"files": {
		  "css": "shell.css",
		  "html.tpl": "shell.html.tpl"
		}
	  }
	]
  }
}
*/
function find_mods_dests(config) {
	let dests = {};
	
	// Loop over the destination names.
	Object.keys(config.modules_dir).forEach(destination => {
		let mods = dests[destination] = {};

		// Loop over the sources (modules directories) for that destination.
		config.modules_dir[destination].forEach(source => {

			
			find_mods_recursive(source, '', mods, config);
		});
	});

	return dests;
}

// Recursively find subdirectories of `dir` that quality as modules.
function find_mods_recursive(source, subdir, mods, config) {
	// The full path of the source modules directory.
	let modules_dir = path.join(config.base, source);
	
	// The full path of the subdirectory we're currently looking at.
	let working_dir = path.join(modules_dir, subdir);
	
	// Map all the modules.	
	if (fs.lstatSync(working_dir).isDirectory()) {
		// Read the modules directory.
		(fs.readdirSync(working_dir, {withFileTypes: true})

			// Only look at directories.
			.filter(ent => ent.isDirectory())

			// Add items to the mods object.
			.forEach(dir => {
				// The full path to this module.
				let thismod_fullpath = path.join(working_dir, dir.name);
				
				// The path to this module relative to the current modules source.
				let thismod_relpath = path.join(subdir, dir.name);
				
				// Create the array to hold modules with this relative path
				// if it doesn't exist already.
				if (!(thismod_relpath in mods)) {
					mods[thismod_relpath] = [];
				}
				
				// Add a new object to represent the module.
				mods[thismod_relpath].push({
					dir: source,
					base: thismod_fullpath,
					files: find_pieces(thismod_fullpath, dir.name),
				});
				
				// Look inside this module for nested modules.
				find_mods_recursive(source, thismod_relpath, mods, config);
			})
		);
	}
}

// Find all the files in a directory whose names without extension
// are the directory name.
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

// Concatenate the files that can be concatenated
// from all the module objects generated by `find_mods_dests`.
/*
{
	"modules-combined": {
		"css": {
			"real_ext": "css",
			"manifest": ["modules-a/shell","modules-b/shell"],
			"files": [
				"/ **************************  modules-a/shell  ************************* /",
				(shell a css),
				"/ **************************  modules-b/shell  ************************* /",
				(shell b css)
			]
		},
		"js": {
			"real_ext": "js",
			"manifest": ["modules-a/shell","modules-b/shell"],
			"files": [
				"/ **************************  modules-a/shell  ************************* /",
				"console.log('shell a');",
				"/ **************************  modules-b/shell  ************************* /",
				"console.log('shell b');"
			]
		}
	}
}
*/
function concatenate(dests, config) {
	let cat_dests = {};
	
	Object.keys(dests).forEach(destination => {
		let mods = dests[destination],
			cat = cat_dests[destination] = {},
			
			dest_dir = path.join(config.base, config.assets_build_dir),
			names = get_order(mods, config);
		
// 		console.log('---- names ----');
// 		console.log(names);
		
		// For each module, add on to the concatenated object,
		// which will get a property named for each file extension 
		names.forEach(key => {
			// get the array of 
			let mod_array = mods[key];
			
			mod_array.forEach(mod => {
				let dir = mod.dir,
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
						
						let manifest_key = path.join(dir, key);
			
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
							cat[ext].files.push(commenter(manifest_key));
						}

						// Push the content onto the files array
						// and the key onto the manifest.
						cat[ext].files.push(content);
						cat[ext].manifest.push(manifest_key);
					}
				});
			});
		});
	});

	return cat_dests;
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

// Get a timestamp URL query to append to asset URLs.
function timestamp(path) {
	let stamp = fs.existsSync(path) ?
		new Date(fs.statSync(path).mtime).getTime() :
		'not-found';
	return '?t=' + stamp;
}

// Build the site's html from lodash templates.
// to-do
// function build_html(config) {
// 	
// }

// Build a list of files that will hold the concatenated contents
// from the files in all the modules.
function plan_files(cat_dests, config) {
	let plan = {};

	// Loop over the destination names.
	Object.keys(cat_dests).forEach(destination => {
		let cat = cat_dests[destination];

		// Loop over the concatenated files.
		Object.keys(cat).forEach(ext => {
			let filename = path.join(
					config.base,
					config.assets_build_dir,
					destination + '.' + ext
				),
				contents = cat[ext].files.join('\n\n'),
				real_ext = cat[ext].real_ext,
				tpl_dev_file = 'dev-' + real_ext + '.tpl',
				tpl_dev_path = path.join(__dirname, tpl_dev_file),
				tpl_dev_exists = fs.existsSync(tpl_dev_path);

			plan[filename] = contents;
	
			if (tpl_dev_exists) {
				let tpl_dev = fs.readFileSync(tpl_dev_path, {encoding: 'utf8'}),
					filename_dev = path.join(
						config.base,
						config.assets_build_dir,
						destination + '-dev.' + ext
					),
					dev_urls = cat[ext].manifest.map(name => {
						let asset = path.join(
							config.base,
							name,
							path.basename(name) + '.' + ext
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
			
// 				console.log('---- ext, plan ----');
// 				console.log(ext);
// 				console.log(plan);
		});
		});

	return plan;
}

const mojl = {
	debug: false,
	build,
	simulate_build,
	commenters,
	rewriters,
};

function debug(val) {
	if (mojl.debug) {
		return console.log(val);
	}
}
debug();

module.exports = mojl;
