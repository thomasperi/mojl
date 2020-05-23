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


// Default configuration options
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
		fs.writeFileSync(filename, plan[filename]);
	});
	return plan;
}

// Build dev and production files based on a directory of modules.
function simulate_build(config) {
	// Superimpose the supplied config file over the defaults.
	_.defaultsDeep(config, config_defaults);

	if (!config.base) {
		throw 'The `base` setting is required.';
	}

	let mods = find_mods(config),
		cat = concatenate(mods, config),
		plan = plan_files(cat, config);
	
	return plan;
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
