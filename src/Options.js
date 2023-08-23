/**
 * These options can be passed to the [`Mojl`](Mojl.md) constructor, or to any
 * method that accepts options. Some options (noted individually below as
 * "constructor only") are ignored by all methods except the constructor.
 *
 * An option passed to the constructor persists for the life of the instance.
 * An accepted option passed to a method persists only for that method call.
 *
 * @namespace
 */
const Options = {

	/**
	 * *constructor only*
	 *
	 * The root directory of the project. If relative, this path is resolved
	 * relative to the current working directory of the process. Thus the empty
	 * string (the default) resolves to the working directory itself.
	 *
	 * @type string
	 * @default #value
	 */
	base: '',

	/**
	 * *constructor only*
	 *
   * An array of "collation" objects describing how the module files should be collated.
   *
	 * @type object[]
	 * @default #value
	 */
	collations: [
		{ modules: ['src/**'] }
	],
	
	/**
	 * *constructor only*
	 *
	 * The default name for collations omitting the optional `name` property.
	 * After the first, any subsequent `name`-less collations are suffixed
	 * with `-1`, `-2`, etc.
	 *
	 * @type string
	 * @default #value
	 */
	collationNamePrefix: 'site',
	
	/**
	 * *constructor only*
	 *
	 * Create a virtual collation for every page, to be referenced as the empty string
	 * when calling `tpl.scripts()` and `tpl.styles()`.
	 *
	 * @type boolean
	 * @default #value
	 */
	collatePages: false,
	
	/**
	 * Module file types to exclude from mirrored assets
	 * besides css, js, tpl.js, and transpiler types.
	 * 
	 * @type string | string[]
	 * @default #value
	 */
	excludeFileTypesFromMirror: [],
	
	/**
	 * Relative to `base`
	 *
	 * @type string
	 * @default #value
	 */
	buildDevDir: 'dev',
	
	/**
	 * Relative to `base`
	 *
	 * @type string
	 * @default #value
	 */
	buildDistDir: 'dist',
	
	/**
	 * Relative to `buildDevDir` and `buildDistDir`
	 *
	 * @type string
	 * @default #value
	 */
	buildAssetsDir: 'assets',
	
	/**
	 * A NodeJS module descriptor to a file or module that exports an object to use as an
	 * adapter for a CSS transpiler such as LESS or SASS.
	 *
	 * Relative to `base` if beginning with `./` or `../`
	 *
	 * The exported object should have two members:
	 * 1. An `inputTypes` property containing an array of strings, indicating the file extensions (without the dot) of the source files it expects, in order of precedence. Example: `['scss', 'css']`
	 * 2. A `run` method which should accept a single argument, an object with the following properties:
	 *
	 * Property      | Type     | Description
	 * --------------|----------|--------------
	 * `sourcePaths` | string[] | An array of source file paths, relative to the parent directory of `entryPath`.
	 * `entryPath`   | string   | The absolute path to the entry file for the adapter to write, and for the transpiler itself to read.
	 * `outputPath`  | string   | The absolute path to the css file for the transpiler to write.
	 * `isDev`       | boolean  | Whether to do a development build, presumably with a sourcemap.
	 *
	 * @type string
	 * @default #value
	 */
	cssTranspilerAdapter: '',

	/**
	 * A NodeJS module descriptor to a file or module that exports a function for minifying
	 * the concatenated CSS code from the included modules. The function should accept a
	 * single string argument and return a string.
	 *
	 * Relative to `base` if beginning with `./` or `../`
	 *
	 * @type string
	 * @default #value
	 */
	cssMinifierAdapter: 'mojl-clean-css',
	
	/**
	 * Prepend mojl's frontend JavaScript library to the front of the first collation.
	 * 
	 * @type boolean
	 * @default #value
	 */
	useFrontendLibrary: false,

	/**
	 * A NodeJS module descriptor to a file or module that exports a function for minifying
	 * the concatenated JavaScript code from the included modules. The function should
	 * accept a single string argument and return a string.
	 *
	 * Relative to `base` if beginning with `./` or `../`
	 *
	 * @type string
	 * @default #value
	 */
	jsMinifierAdapter: 'mojl-terser',

	/**
	 * The path of the module that acts as the root directory
	 * for finding templates to be built.
	 *
	 * Relative to `base`
	 *
	 * @type string
	 * @default #value
	 */
	templateHomeModule: 'src/home',

	/**
	 * The string to append to each module in (and including) `templateHomeModule`
	 * in order to produce the filename where the template output will be written.
	 *
	 * The default `/index.html` is for building static sites with "friendly" urls without
	 * file extensions. For example, the module `{project}/src/home/products/widgets` would
	 * output the file `{project}/dist/products/widgets/index.html` so that the URL of the
	 * page can be `example.com/products/widgets/`
	 *
	 * If the suffix were `.html` instead, with no leading slash or base filename,
	 * then the file written from `{project}/src/home/products/widgets` would be
	 * `<project>/dist/products/widgets.html`.
	 *
	 * **_Note:_** The home module's own template is ignored when the output
	 * suffix begins with anything other than a slash, because otherwise the path
	 * would be outside the output root.
	 *
	 * @type string
	 * @default #value
	 */
	templateOutputSuffix: '/index.html',
	
	/**
	 * How many levels deep an include can go.
	 *
	 * @type number
	 * @default #value
	 */
	maxIncludeDepth: 100,

	/**
	 * If `false` (default), URLs are written relative to `buildDevDir` or `buildDistDir`
	 * with a slash at the front to form a site-relative URL.
	 *
	 * If `true`, URLs in templates are written relative to the current template's output
	 * file to form a page-relative URL.
	 *
	 * @type boolean
	 * @default #value
	 */
	pageRelativeUrls: false,
	
	/**
	 * Symlink assets when building dev rather than copying them.
	 *
	 * @type boolean
	 * @default #value
	 */
	symlinkDevAssets: true,

	/**
	 * Symlink assets when building dist rather than copying them.
	 *
	 * @type boolean
	 * @default #value
	 */
	symlinkDistAssets: false,
	
	/**
	 * Trim whitespace from head and tail of each include.
	 *
	 * @type boolean
	 * @default #value
	 */
	trimIncludes: true,

	/**	
	 * If true, build the dev versions of files. If false, build dist.
	 *
	 * @type boolean
	 * @default #value
	 */
	isDev: false,

};

module.exports = Options;
