## Transpiler Adapters

> This feature is more experimental than the rest of Mojl. 

There's a good chance you'll want to use SASS in a Mojl project. Mojl's organizational system is fundamentally different from that of SASS, though, so we need an easy way to tell SASS where to find the files it needs and where to write the files it creates.

The [`cssTranspilerAdapter`](api.md#csstranspileradapter) option aims to solve that problem by letting you define an adapter to bridge the gap. One such adapter (the only one at the time of this writing) is [mojl-sass](https://www.npmjs.com/package/mojl-sass).

It's not a Mojl dependency, so add it to your project...

```
npm i mojl-sass
```

Then assign its name to the `cssTranspilerAdapter` option when instantiating your Mojl object:

```javascript
new Mojl({
  cssTranspilerAdapter: 'mojl-sass'
});
```

That's it! You can load the styles onto your site's pages with [`tpl.styles()`](templates.md#scripts-and-styles) in exactly the same way as regular CSS.


### `@use`

Okay okay, there's a *little* more to it.

The `mojl-sass` adapter automagically generates a SASS "entry point" file that loads all your SASS source files, and so it doesn't give you fine control over how the files are `@use`d there. The file looks basically like this:

```scss
@use "path/to/src/foo/foo.scss";
@use "path/to/src/bar/bar.scss";
// ...
```

This means that if you're sharing variables, mixins, etc. between SASS files, it's a good idea to separate your SASS code into separate modules for:

- Defining things intended to be `@use`d elsewhere, and
- Outputting CSS code.

(Modules that output CSS code can still define variables, etc. They just shouldn't be `@use`d by other modules.)

That way, let's say `foo.scss` defines:
```scss
$fs: italic;
```

It'll still get `@use`d from the entry point file, but then `bar.scss` can also `@use` it:

```scss
@use "../foo/foo";
/*
The double-naming is a side effect of Mojl's file organization.
There's no good way around it, but it's not a big problem either.
*/

.bar {
  font-style: foo.$fs;
}
```


## That's It for the Guide

(...for now.)

More details (about transpiler adapters and other features) are documented on the [API](api.md) page.


---

[< Back to Navigation](index.md#navigation)