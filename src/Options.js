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
	 * *Constructor only*
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
	 * An array of module directory names and/or wildcards to collate into the output
	 * files. Supports `*` and `**` which behave roughly like glob, but other glob
	 * features are not supported.
	 *
	 * Relative to `base`
	 *
	 * @type string | string[]
	 * @default #value
	 */
	modules: ['src/**'],
	
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
	 * Relative to `buildDevDir` and `buildDistDir`
	 *
	 * @type string
	 * @default #value
	 */
	buildTempDir: 'temp',

	/**
	 * Relative to `buildDevDir` and `buildDistDir`
	 *
	 * @type string
	 * @default #value
	 */
	buildJsFile: 'scripts.js',

	/**
	 * Relative to `buildDevDir` and `buildDistDir`
	 *
	 * @type string
	 * @default #value
	 */
	buildCssFile: 'styles.css',
	
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
	cssTranspilerAdaptor: '',

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
	cssMinifierAdaptor: '',

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
	jsMinifierAdaptor: '',

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
	 * The path of the directory where the output of the template files will be written.
	 *
	 * Relative to `buildDevDir` and `buildDistDir`
	 *
	 * @type string
	 * @default #value
	 */
	templateOutputDir: '',

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