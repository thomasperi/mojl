## API

*[Table of Contents](#table-of-contents) at the end*

---

### `Mojl` Constructor

> `new Mojl([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | See [`Options`](#options) below.

Creates a new Mojl instance with methods for building a project.


#### `build`

> `.build([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Performs all build tasks:

* [`.deleteBuild`](#deletebuild)
* [`.buildStyles`](#buildstyles)
* [`.buildScripts`](#buildscripts)
* [`.mirrorAssets`](#mirrorassets)
* [`.buildTemplates`](#buildtemplates)


#### `buildScripts`

> `.buildScripts([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds a JavaScript file based on the JavaScript files for all the modules in use.

By default, it concatenates all the `.js` files into one file named `scripts.js`, located in the `dist` subdirectory inside the project's base directory.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`buildJsFile`](#buildjsfile)
* [`isDev`](#isdev)
* [`jsMinifierAdaptor`](#jsminifieradaptor)



#### `buildStyles`

> `.buildStyles([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds a CSS file based on the stylesheets for all the modules in use.

By default, it concatenates all the `.css` files into one file named `styles.css`, located in the `dist` subdirectory inside the project's base directory.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`buildCssFile`](#buildcssfile)
* [`cssMinifierAdaptor`](#cssminifieradaptor)
* [`cssTranspilerAdaptor`](#csstranspileradaptor)
* [`isDev`](#isdev)


#### `buildTemplates`

> `.buildTemplates([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds output files based on the `.tpl.js` template files for the home module and all modules inside it, recursively. The path of each output file is based on the path of the module it's built from.

By default:
* The `src/home/home.tpl.js` template outputs to `dist/index.html`.
* Modules inside `src/home` output to paths determined by the path of the module. For example, `src/home/about/about.tpl.js` outputs to `dist/about/index.html`.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`isDev`](#isdev)
* [`templateHomeModule`](#templatehomemodule)
* [`templateOutputDir`](#templateoutputdir)
* [`templateOutputSuffix`](#templateoutputsuffix)


#### `deleteBuild`

> `.deleteBuild([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Deletes a build directory if it exists.

By default, it deletes the `dist` directory at the project's base.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`isDev`](#isdev)


#### `getBase`

> `.getBase()`

**Returns:** Promise
**Resolves:** String

The full filesystem path to the project's base directory.


#### `getModuleList`

> `.getModuleList()`

**Returns:** Promise
**Resolves:** Array

The array of module paths (relative to the project's base directory) this `Mojl` instance is working from.


#### `mirrorAssets`

> `.mirrorAssets([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | Optional overrides to the instance [`Options`](#options)

**Returns:** Promise

Mirrors assets from the source directory to the build directory, preserving directory structure.

By default, it copies assets other than JS and CSS files, from all the modules that are in use, into the `dist/assets` directory.

The following options can potentially change the default behavior:

* [`buildAssetsDir`](#buildassetsdir)
* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`excludeFileTypesFromMirror`](#excludefiletypesfrommirror)
* [`isDev`](#isdev)
* [`symlinkDevAssets`](#symlinkdevassets)
* [`symlinkDistAssets`](#symlinkdistassets)

---

### `Options`

These options can be passed to the [`Mojl`](#mojl-constructor) constructor, or to any instance method that accepts options. Some options (noted individually below as "constructor only") are ignored by methods other than the constructor.

An option passed to the constructor persists for the life of the instance.

An accepted option passed to a method applies only to that method call.


#### `base`

> *constructor only*

The root directory of the project. If relative, this path is resolved relative to the current working directory of the process. Thus the empty string (the default) resolves to the working directory itself.

| Type   | Default
|--------|---------------------
| string | `''` (empty string)


#### `buildAssetsDir`

The directory where files other than `<module>.*` files will be mirrored.

| Type   | Default    | Notes
|--------|------------|-----------
| string | `'assets'` | Relative to `buildDevDir` or `buildDistDir`


#### `buildCssFile`

The CSS file to be built.

| Type   | Default        | Notes
|--------|----------------|-----------
| string | `'styles.css'` | Relative to `buildDevDir` or `buildDistDir`


#### `buildDevDir`

The directory where dev builds are to be written.

| Type   | Default | Notes
|--------|---------|-----------
| string | `'dev'` | Relative to `base`


#### `buildDistDir`

The directory where production builds are to be written.

| Type   | Default  | Notes
|--------|----------|-----------
| string | `'dist'` | Relative to `base`


#### `buildJsFile`

The JavaScript file to be built.

| Type   | Default        | Notes
|--------|----------------|-----------
| string | `'scripts.js'` | Relative to `buildDevDir` or `buildDistDir`


#### `buildTempDir`

The directory where temporary files are written during build and then removed.

| Type   | Default  | Notes
|--------|----------|-----------
| string | `'temp'` | Relative to `buildDevDir` or `buildDistDir`


#### `cssMinifierAdaptor`

A Node.js module to use as an adapter for a CSS minifier.

| Type   | Default             | Notes
|--------|---------------------|-----------
| string | `''` (empty string) | Relative to `buildDevDir` or `buildDistDir`

When the value begins with with `./` or `../`, it is resolved relative to `base`.

The module's default export should be a function that accepts a single string argument and returns a string or a Promise that resolves to a string.


#### `cssTranspilerAdaptor`

A Node.js module to use as an adapter for a CSS transpiler such as LESS or SASS.

| Type   | Default
|--------|---------------------
| string | `''` (empty string)

When the value begins with with `./` or `../`, it is resolved relative to `base`.

The module should export two named members:

1. An `inputTypes` property containing an array of strings, indicating the file extensions (without the dot) of the source files it expects, in order of precedence. e.g.: `['scss', 'css']`
  
2. A `run` method which should expect a single argument of an object with the following properties, and use them to run the transpiler.

| Property      | Type     | Description
|---------------|----------|--------------
| `entryPath`   | string   | The absolute path to the entry file for the adapter to write, and for the transpiler to read.
| `isDev`       | boolean  | `true` if the transpiler should build for development (presumably with a sourcemap), `false` for a production build.
| `outputPath`  | string   | The absolute path to the css file for the transpiler to write.
| `sourcePaths` | string[] | An array of source file paths, relative to the parent directory of `entryPath`.


#### `excludeFileTypesFromMirror`

Module file types to exclude from mirrored assets besides css, js, tpl.js, and transpiler types.

| Type     | Default
|----------|---------------------
| string[] | `[]` (empty string)


#### `isDev`

| Type    | Default
|---------|---------
| boolean | `false`

If true, build the dev versions of files. If false, build dist.


#### `jsMinifierAdaptor`

A Node.js module to use as an adapter for a JS minifier.

| Type   | Default             | Notes
|--------|---------------------|-----------
| string | `''` (empty string) | Relative to `buildDevDir` or `buildDistDir`

When the value begins with with `./` or `../`, it is resolved relative to `base`.

The module's default export should be a function that accepts a single string argument and returns a string or a Promise that resolves to a string.


#### `maxIncludeDepth`

How many levels deep an include can go.

| Type   | Default
|--------|---------------------
| number | `100`


#### `modules`

> *constructor only*

An array of module directory names and/or wildcards to collate into the output files. Supports `*` and `**` which behave roughly like glob, but other glob features are not supported.

| Type     | Default      | Notes
|----------|--------------|-------
| string[] | `['src/**']` | Relative to `base`


#### `pageRelativeUrls`

Determines how URLs are written in template output.

| Type    | Default
|---------|---------
| boolean | `false`

If `false` (default), URLs are written relative to `buildDevDir` or `buildDistDir` with a slash at the front to form a site-relative URL.

If `true`, URLs in templates are written relative to the current template's output file to form a page-relative URL.


#### `symlinkDevAssets`

Symlink assets when building dev rather than copying them.

| Type    | Default
|---------|---------
| boolean | `true`


#### `symlinkDistAssets`

Symlink assets when building dist rather than copying them.

| Type    | Default
|---------|---------
| boolean | `false`


#### `templateHomeModule`

The path of the module that acts as the root directory for finding templates to be built.

| Type   | Default      | Notes
|--------|--------------|-----------
| string | `'src/home'` | Relative to `base`


#### `templateOutputDir`

The path of the directory where the output of the template files will be written.

| Type   | Default             | Notes
|--------|---------------------|-----------
| string | `''` (empty string) | Relative to `buildDevDir` or `buildDistDir`


#### `templateOutputSuffix`

The string to append to each module in (and including) `templateHomeModule` in order to produce the filename where the template output will be written.

| Type   | Default
|--------|-----------------
| string | `'/index.html'`

The default `/index.html` builds for "friendly" urls without file extensions. For example, the module `src/home/products/widgets` would output the file `dist/products/widgets/index.html` so that the URL of the page can be `example.com/products/widgets/`.

```
<base>/src/home/about -> <base>/dist/about/index.html -> https://example.com/about/
                                          ^^^^^^^^^^^
```

If the suffix is set to `.html` instead, just the extension with no leading slash, then the file gets the name of the module instead.

```
<base>/src/home/about -> <base>/dist/about.html -> https://example.com/about.html
                                          ^^^^^
```

**Important:** When the output suffix begins with anything other than a slash, the `home` module's own template is ignored and no output is written, because otherwise the output file would be outside the output root.

A suffix with a leading slash produces a file inside `dist`:
```
<base>/src/home -> <base>/dist/index.html -> https://example.com/
                              ^^^^^^^^^^^
```

A suffix without a leading slash produces a home page that is outside `dist`:
```
<base>/src/home -> <base>/dist.html -> Unreachable on the web
                              ^^^^^
```


#### `trimIncludes`

Trim whitespace from head and tail of each include.

| Type    | Default
|---------|---------
| boolean | `true`




---

### `TemplateHelper`

to-do

---

### Table of Contents

* [`new Mojl([options])`](#mojl-constructor)
  * [`.build([options])`](#build)
  * [`.buildScripts([options])`](#buildscripts)
  * [`.buildStyles([options])`](#buildstyles)
  * [`.buildTemplates([options])`](#buildtemplates)
  * [`.deleteBuild([options])`](#deletebuild)
  * [`.getBase()`](#getbase)
  * [`.getModuleList()`](#getmodulelist)
  * [`.mirrorAssets([options])`](#mirrorassets)

* [`Options`](#options)
  * [`base`](#base)
  * [`buildAssetsDir`](#buildassetsdir)
  * [`buildCssFile`](#buildcssfile)
  * [`buildDevDir`](#builddevdir)
  * [`buildDistDir`](#builddistdir)
  * [`buildJsFile`](#buildjsfile)
  * [`buildTempDir`](#buildtempdir)
  * [`cssMinifierAdaptor`](#cssminifieradaptor)
  * [`cssTranspilerAdaptor`](#csstranspileradaptor)
  * [`excludeFileTypesFromMirror`](#excludefiletypesfrommirror)
  * [`isDev`](#isdev)
  * [`jsMinifierAdaptor`](#jsminifieradaptor)
  * [`maxIncludeDepth`](#maxincludedepth)
  * [`modules`](#modules)
  * [`pageRelativeUrls`](#pagerelativeurls)
  * [`symlinkDevAssets`](#symlinkdevassets)
  * [`symlinkDistAssets`](#symlinkdistassets)
  * [`templateHomeModule`](#templatehomemodule)
  * [`templateOutputDir`](#templateoutputdir)
  * [`templateOutputSuffix`](#templateoutputsuffix)
  * [`trimIncludes`](#trimincludes)

* [`TemplateHelper`](#templatehelper)

---

[< Back to Navigation](index.md#navigation)