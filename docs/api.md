## API

### `Mojl`

> `new Mojl([options])`

| Parameter | Type   | Description
|-----------|--------|-------------
| `options` | object | See [`Options`](#options) below.

Creates a new Mojl instance with methods for building a project.


#### `base`

> `.base()`

**Returns:** Promise
**Resolves:** String

The full filesystem path to the project's base directory.


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


#### `listModules`

> `.listModules()`

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


### `Options`

to-do


### `TemplateHelper`

to-do

