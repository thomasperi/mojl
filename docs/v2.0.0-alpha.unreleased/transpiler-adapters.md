## Transpilers

> This feature is more experimental than the rest of Mojl. 

There's a good chance you want to use SASS in your project. But Mojl's organizational system is fundamentally different from that of SASS. We need an easy way to tell SASS where everything is and where it's going.

The [`cssTranspilerAdapter`](api.md#csstranspileradapter) option aims to solve that problem by letting you define an "adapter" that tells SASS or another transpiler how to do things. One such adapter (the only one at the time of this writing) is [mojl-sass](https://www.npmjs.com/package/mojl-sass).

It's not a Mojl dependency, so install it...

```
npm i mojl-sass
```

Then assign its name to the `cssTranspilerAdapter` option when instantiating your Mojl object:

```javascript
new Mojl({
  cssTranspilerAdapter: 'mojl-sass'
});
```


### How It Works

The adapter tells Mojl which file type(s) the source files should be (in this case `.scss` and `.css`, since SASS can use CSS as source files).

Mojl rewrites URLs in the source files (just like it does with plain CSS), writes the resulting files to a special directory, and sends the adapter four things:

- A list of the url-replaced source files,
- The path where the adapter should write an entry point file referencing all the source files,
- The path where the adapter should write the output file from the transpiler, and
- A flag indicating whether to build for dev or dist, so that the adapter can add a source map for dev and compress the output for dist.

The adapter then writes the entry point file, runs the transpiler on it, and writes the CSS output file.

You can then load that output file onto your site's pages with [`tpl.styles()`](templates.md#scripts-and-styles) exactly the same as regular CSS.


### Limitations

Since the SASS entry point is written automagically, the `mojl-sass` adapter doesn't give you fine control over how the files are `@use`d there. It looks something like this:

```scss
@use "path/to/src/foo/foo.scss";
@use "path/to/src/bar/bar.scss";
// ...
```

This means that every Mojl module should do *either but not both*:
- Output CSS, or
- Define SASS variables, mixins, etc.

That way, let's say `foo.scss` defines:
```scss
$fs: italic;
```

It'll still get `@use`d from the entry point, but then `bar.scss` can also `@use` it:

```scss
@use "../foo/foo";
/*
The double-naming is a side effect of Mojl's organization.
There's no good way around it, but it's not a big problem either.
*/

.bar {
	font-style: foo.$fs;
}
```


## That's It for the Guide

(...for now.)

Lots more details are documented on the [API](api.md) page.


---

[< Back to Navigation](index.md#navigation)