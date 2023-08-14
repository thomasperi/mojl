## API

*[Table of Contents](#table-of-contents) at the end*

---

### `Mojl`

> `new Mojl([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) See [`Options`](#options) below.

Creates a new Mojl instance with methods for building a project.


#### `build`

> `mojl.build([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Performs all build tasks:

* [`deleteBuild`](#deletebuild)
* [`buildStyles`](#buildstyles)
* [`buildScripts`](#buildscripts)
* [`mirrorAssets`](#mirrorassets)
* [`buildTemplatesAuto`](#buildtemplatesauto)


#### `buildScripts`

> `mojl.buildScripts([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds a JavaScript file based on the JavaScript files for all the modules in use.

By default, it concatenates all the `.js` files into one file named `site.js`, located in the `dist` subdirectory inside the project's base directory.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`buildJsFile`](#buildjsfile)
* [`isDev`](#isdev)
* [`jsMinifierAdaptor`](#jsminifieradaptor)



#### `buildStyles`

> `mojl.buildStyles([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds a CSS file based on the stylesheets for all the modules in use.

By default, it concatenates all the `.css` files into one file named `site.css`, located in the `dist` subdirectory inside the project's base directory.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`buildCssFile`](#buildcssfile)
* [`cssMinifierAdaptor`](#cssminifieradaptor)
* [`cssTranspilerAdaptor`](#csstranspileradaptor)
* [`isDev`](#isdev)


#### `buildTemplate`

> `mojl.buildTemplate(docPrefix, module[, props[, options]])`

| Parameter   | Type   | Description
|-------------|--------|-------------
| `docPrefix` | string | The prefix for determining where to write the output document.
| `module`    | string | The module whose template will build the document.
| `props`     | object | (optional) An props object to pass to the module.
| `options`   | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds an output file based on the `.tpl.js` template file for the specified `module`. 

The `docPrefix` argument plus the [`templateOutputSuffix`](#templateoutputsuffix) option determine the file to be written. For example:

| `docPrefix`  | `templateOutputSuffix`    | Output File
|--------------|---------------------------|-------------
| `'/'`        | `'/index.html'` (default) | `(build dir)/index.html`
| `'foo/bar'`  | `'.html'`                 | `(build dir)/foo/bar.html`

> See the caveat under [`templateOutputSuffix`](#templateoutputsuffix).

The following options influence the file path that gets written:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`isDev`](#isdev)
* [`templateOutputSuffix`](#templateoutputsuffix)


#### `buildTemplatesAuto`

> `mojl.buildTemplatesAuto([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Builds output files based on the `.tpl.js` template files for the home module and all modules inside it, recursively. The path of each output file is based on the path of the module it's built from.

By default:
* The `src/home/home.tpl.js` template outputs to `dist/index.html`.
* Modules inside `src/home` output to paths determined by the path of the module. For example, `src/home/about/about.tpl.js` outputs to `dist/about/index.html`.

> See the caveat under [`templateOutputSuffix`](#templateoutputsuffix).

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`isDev`](#isdev)
* [`templateHomeModule`](#templatehomemodule)
* [`templateOutputSuffix`](#templateoutputsuffix)


#### `deleteBuild`

> `mojl.deleteBuild([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

**Returns:** Promise

Deletes a build directory if it exists.

By default, it deletes the `dist` directory at the project's base.

The following options can potentially change the default behavior:

* [`buildDevDir`](#builddevdir)
* [`buildDistDir`](#builddistdir)
* [`isDev`](#isdev)


#### `getBase`

> `mojl.getBase()`

**Returns:** Promise -> String

The full filesystem path to the project's base directory.


#### `getModuleList`

> `mojl.getModuleList()`

**Returns:** Promise -> Array

The array of module paths (relative to the project's base directory) this `Mojl` instance is working from.


#### `mirrorAssets`

> `mojl.mirrorAssets([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | (optional) Overrides to the instance [`Options`](#options)

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

These options can be passed to the [`Mojl`](#mojl) constructor, or to any instance method that accepts options. Some options (noted individually below as "constructor only") are ignored by methods other than the constructor.

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
| string | `'site.css'` | Relative to `buildDevDir` or `buildDistDir`


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
| string | `'site.js'` | Relative to `buildDevDir` or `buildDistDir`


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


#### `templateOutputSuffix`

The string to append to a path prefix when writing template output files.

| Type   | Default
|--------|-----------------
| string | `'/index.html'`

There are two ways of using this, each for its own purpose:

1. If the suffix is a slash plus a filename (as in the default `/index.html`) the prefix is used as a directory (because of the slash) and the output file will be given that filename inside it. This gives you pretty URLs without file extensions.

2. If the suffix is a dot plus an extension, such as `.html`, the prefix is used as the name of the file, with the file extension added. This is the better choice when you're outputting templates for another SSG or framework, or when you're building a site that will be loaded directly from disk and not from a web server.

**Caveat for Pattern #2:**

You shouldn't attempt to build a document at the root of the build directory (i.e., with an empty string or single slash for the prefix) when using just an extension, because the output file will be named using only the extension beginning with with a dot, which is probably not desirable. (e.g. `https://example.com/.html`)

This means that if you've got modules automatically being built from [`templateHomeModule`](#templatehomemodule), the home module should not have a template of its own when `templateOutputSuffix` follows pattern #2. Instead, if you're building a static site this way, you can create an `index` module inside the `home` module.


#### `trimIncludes`

Trim whitespace from head and tail of each include.

| Type    | Default
|---------|---------
| boolean | `true`




---

### `TemplateHelper`

A template helper is a [tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) passed as the first argument to the function exported by a Mojl template.

> In this documentation, the parameter is named `tpl`, but of course any valid JavaScript identifier will work.

**Returns:** Promise -> String

Example Usage:

```javascript
module.exports = (tpl, props) => tpl`
  <p>Lorem ${props.ipsum} dolor sit amet</p>
`;
```

The helper function itself has methods that can be used inside the template:

#### `exists`

> `tpl.exists(module)`

Check whether a given module exists and has a template.

| Parameter | Type   | Description
|-----------|--------|-------------
| `module`  | string | The name of the module to check, relative to the project's `base`

**Returns:** Boolean


#### `file`

> `tpl.file(filePath, [options])`

Get a URL for the specified file path.

| Parameter       | Type    | Description
|-----------------|---------|-------------
| `filePath`      | string  | The path of the file to get a URL for
| `options`       | object  | (optional) Options affecting the behavior of this method
| `options.hash`  | boolean | Append a cache-busting hash to the URL. (default `true`)

If `filePath` is a relative path, it is relative to the current template's parent directory.

**Returns:** Promise -> String


#### `include`

> `tpl.include(module, [props])`

Include the named module's template.

| Parameter | Type   | Description
|-----------|--------|-------------
| `module`  | string | The name of the module to include, relative to the project's `base`
| `props`   | object | (optional) The object for passing properties to the module.

**Returns:** Promise -> String


#### `link`

> `tpl.link(linkPath)`

Potentially transform the specified link URL.

| Parameter  | Type   | Description
|------------|--------|-------------
| `linkPath` | string | The link to potentially transform.

Full URLs with scheme (`http://example.com`), as well as scheme-relative URLs (`//example.com`), are returned as-is.

Page-relative URLs (`./foo/bar`, `../foo/bar`, `foo/bar`) and site-relative URLs (`/foo/bar`) are potentially transformed according to the [`pageRelativeUrls`](#pagerelativeurls) Mojl setting:

| `pageRelativeUrls` | Behavior
|--------------------|----------
| `false` (default)  | Page-relative URLs are converted to site-relative
| `true`             | Site-relative URLs are converted to page-relative


**Returns:** Promise -> String


#### `script`

> `tpl.script([options])`

Get an HTML tag for loading a JavaScript file on the current page.

| Parameter       | Type   | Description
|-----------------|--------|-------------
| `options`       | object | (optional) Options affecting the behavior of this method
| `options.file`  | string | The site-relative path to a specific file to load

If `options.file` is omitted, the tag will load `/site.js` or the script specified in the [`buildJsFile`](#buildjsfile) Mojl option.

**Returns:** Promise -> String


#### `style`

> `tpl.style([options])`

Get an HTML tag for loading a stylesheet file on the current page.

| Parameter       | Type   | Description
|-----------------|--------|-------------
| `options`       | object | (optional) Options affecting the behavior of this method
| `options.file`  | string | The site-relative path to a specific file to load

If `options.file` is omitted, the tag will load `/site.css` or the stylesheet specified in the [`buildCssFile`](#buildcssfile) Mojl option.

**Returns:** Promise -> String


---

### Table of Contents

* [`new Mojl([options])`](#mojl)
  * [`build([options])`](#build)
  * [`buildScripts([options])`](#buildscripts)
  * [`buildStyles([options])`](#buildstyles)
  * [`buildTemplate(docPrefix, module[, props, options])`](#buildtemplate)
  * [`buildTemplatesAuto([options])`](#buildtemplatesauto)
  * [`deleteBuild([options])`](#deletebuild)
  * [`getBase()`](#getbase)
  * [`getModuleList()`](#getmodulelist)
  * [`mirrorAssets([options])`](#mirrorassets)

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
  * [`templateOutputSuffix`](#templateoutputsuffix)
  * [`trimIncludes`](#trimincludes)

* [`TemplateHelper`](#templatehelper)
  * [`exists`](#exists)
  * [`file`](#file)
  * [`include`](#include)
  * [`link`](#link)
  * [`script`](#script)
  * [`style`](#style)
  * [`template`](#template)

---

[< Back to Navigation](index.md#navigation)