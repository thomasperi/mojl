## Collations

By default, `site.js` and `site.css` are built from all the `.js` and `.css` files inside a project's `src` directory, in alphabetical order. But sometimes that's not what we want. Enter collations.

Collations let you:
- Control the order in which the modules load, and
- Split the modules into multiple output files.

A collation is defined as a JavaScript object describing which modules to concatenate into which script and stylesheet.

Here's the default array of collations (only one collation in the array) that causes everything in `src` to be concatenated into `site.js` and `site.css`:

```javascript
[ { name: 'site', modules: ['src/**'] } ]
```

The `name` property is a string defining the name of the output files,`site.js` and `site.css`.

The `modules` property is an array of strings defining which modules should be included. The default value uses the `**` wildcard to match all modules recursively inside `src`.

### Reordering

To change how the files are collated, set a new array as the [`collations`](apl.md#collations) option passed to the `Mojl` constructor.

For example, maybe you want your `shell` module's JS and CSS to load first, and the `foo` module to load last, and the order of the remaining modules doesn't matter. The explicit items' positions take precedence over the wildcard. 

```javascript
const mojl = new Mojl({
  collations: [
    { name: 'site', modules: [
      'src/shell',
      'src/**'
      'src/foo',
    ] },
  ],
});
```

### Splitting

You might also want some modules to be concatenated into their own file separate from the rest of the modules. For example, if you've installed modules from npm that are updated more often or less often than your site is, separating them can allow users' browsers to keep their cached version of one set of modules while loading the newest version of another set.

The following collations array concatenates the two modules from `node_modules` into `npm.js` and `npm.css`, and everything in `src` into `site.js` and `site.css`:

```javascript
const mojl = new Mojl({
  collations: [
    { name: 'npm', modules: [
      'node_modules/third-party-module',
      'node_modules/my-own-reusable-module',
    ] },
    { name: 'site', modules: ['src/**'] }, // Don't forget to re-include the default!
  ],
});
```

> Note that you should NOT use a wildcard to load everything in `node_modules`. Load each desired module individually.


### Collations in Templates

Calling `tpl.scripts()` and `tpl.styles()` in a template automagically loads all collations in order. To continue the example from above:

```html
tpl.scripts()     -->     <script src="/npm.js"></script>
                          <script src="/site.js"></script>
```

To change the order, pass in an array of the collation names in the order you want:

```
tpl.scripts(['site', 'npm'])   -->   <script src="/site.js"></script>
                                     <script src="/npm.js"></script>
```

Or you can do one at a time:

```
tpl.scripts(['npm'])   -->   <script src="/npm.js"></script>
```


### Exclusions

Another reason for splitting modules into multiple collations is that a section of your site might have heavy styling that isn't needed in other sections. You can create a collation for any section you want to separate, but if it's a subset of another collation, you'll need to exclude the subset from the superset, using the `!` mark:

```javascript
const mojl = new Mojl({
  collations: [
  
    // Everything in `src` goes in `site`, except `recipes` and its contents.
    { name: 'site', modules: ['src/**', '!src/recipes/**'] },
    
    // Everything in `recipes` gets put in recipes.css` and `recipes.js`.
    { name: 'recipes', modules: ['src/recipes/**'] },
    
  ],
});
```


### Individual Pages

Most sites don't have much customization on individual pages, but if yours does, it's easy to automatically load them all separately without explicitly naming each one. Use the [`collatePages`](api.md#collatepages) option:

```javascript
const mojl = new Mojl({
  collatePages: true,
});
```

Since this example doesn't override the default collations, `collatePages: true` causes everything to go in `site.js` and `site.css` like normal, *except* for the scripts and styles for each page. A separate collation will be automatically created for each page in `src/home`.

The page collation for the currently-rendering page is included in the default output of `tpl.scripts()` and `tpl.styles()`. So if we're generating the HTML for `https://example.com/foo/bar/index.html`, calling `tpl.scripts()` with no arguments would output:

```html
<script src="/site.js"></script>
<script src="/foo/bar/index.js"></script>
```

To reference the current page's collation, use the empty string as the collation name:

```
tpl.scripts([''])   -->   <script src="/foo/bar/index.js"></script>
```


## That's It for the Guide

(...for now.)

Lots more details are documented on the [API](api.md) page.


---

[< Back to Navigation](index.md#navigation)