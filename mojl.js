/*!
 * mojl v1.0.0
 *
 * A node module to allow "content modules" with related assets grouped
 * together during development, and concatenate each file type from all the
 * modules into single monolithic .js, .css, etc. files.
 * (c) Thomas Peri <hello@thomasperi.net>
 * MIT License
 */

/*global require, module, __dirname */
let fs = require('fs');
let path = require('path');

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
	config = Object.assign({

		// The base directory for everything mojl does.
		// Required. (Don't uncomment)
// 		"base": "./web/wp-content/themes/your-theme",

		// The directory to find the modules in, relative to `base`.
		"modules_dir": "modules",

		// The directory to build the monolithic files in, relative to `base`.
		"build_dir": "build",
		
		// The directory to find images in, relative to each module directory.
		"img_dir": "images",

		// Which file extensions to concatenate.
		"concat_exts": [
			"css",
			"scss",
			"js",
		],
		
		// Types of files in which to rewrite image paths.
		"img_rewrite": [
			"css",
			"scss",
		],
		
		// Define the order in which the modules should be loaded.
		"module_order": {
			// Modules that should be loaded first
// 			"head": [],

			// Modules that should be loaded last
// 			"tail": [],
		}
	}, config);

	config.module_order = Object.assign({
		"head": [],
		"tail": []
	}, config.module_order);
	
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
					images: find_images(thismod_dir, config.img_dir),
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

// Add a list of files in this module's image directory.
function find_images(thismod_dir, dirname) {
	let images_dir = path.join(thismod_dir, dirname);
	return (
		fs.existsSync(images_dir) && 
		fs.lstatSync(images_dir).isDirectory()
	) ? (fs
		.readdirSync(images_dir, {withFileTypes: true})
		.filter(ent => ent.isFile())
		.map(file => path.join(dirname, file.name))
	) : [];
}

// 
function concatenate(mods, config) {
	let cat = {},
		abs_prefix = path.join(config.base, config.build_dir),
		names = get_order(mods, config);

	// For each module, add on to the concatenated object,
	// which will get a property named for each file extension 
	names.forEach(key => {
		let mod = mods[key],
			base = mod.base,
			files = mod.files,
			images = mod.images,
			exts = config.concat_exts;
	
		// For each type of file in the module...
		Object.keys(files).forEach(ext => {
			// Verify that we should be concatenating this file type...
			if (exts.includes(ext)) {
				// Add the property to the concatenation object
				// if it doesn't already exist...
				if (!cat[ext]) {
					cat[ext] = {
						manifest: [],
						files: [],
					};
				}
			
				// Read the source file...
				let content = fs.readFileSync(
						path.join(base, files[ext]),
						{encoding: 'utf8'}
					);
			
				// Rewrite image names in specified file types...
				if (config.img_rewrite.includes(ext)) {
					images.forEach(rel_img => {
						let path_img = path.join(base, rel_img),
							ts = timestamp(path_img);
						content = content.replace(
							rel_img,
							() => path.relative(abs_prefix, path_img) + ts
						);
					});
				}
			
				// Push the content onto the array,
				// along with a comment indicating which module it came from.
				cat[ext].manifest.push(key);
				cat[ext].files.push(center_name(key));
				cat[ext].files.push(content);
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

// Just for fun, center the name of the component in a long banner comment.
function center_name(name, width) {
	width = width || 72;
	let fill = width - 4, // Allow for the /* and */
		padded = `  ${name}  `,
		stars = Math.max(0, fill - padded.length),
		half = stars / 2,
		before = Math.ceil(half),
		after = Math.floor(half);
	return '/*' + '*'.repeat(before) + padded + '*'.repeat(after) + '*/';
}

// Get a timestamp URL query to append to asset URLs.
function timestamp(path) {
	if (fs.existsSync(path)) {
		return '?t=' + new Date(fs.statSync(path).mtime).getTime();
	}
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
			
			tpl_dev_path = path.join(__dirname, 'dev-' + ext + '.tpl'),
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

module.exports = {
	build,
	simulate_build,
};
