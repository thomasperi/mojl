# Transpiler Adapters

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


## Caveats

Okay okay, there's a *little* more to it. If you're sharing variables, mixins, etc. between SASS files, read these next two things.


### Every SASS File in a Module

It might seem like a good idea to define variables, mixins, etc. on their own instead of inside a Mojl module, especially if the SASS files they're in don't directly produce any output.

But don't.

The loaded modules get "mirrored" into a special directory where relative URLs are rewritten. Mojl won't know to follow the `@use` statements in order to mirror those files too, and so those links will break.

Just put each SASS file in its own module, and then they can be `@use`d via relative paths.


### Variables, etc.

The `mojl-sass` adapter automagically generates a SASS "entry" file that loads all the source files, and so it doesn't give you fine control over how the files are `@use`d in that entry file.

This means that it's a good idea to keep your SASS code divided into separate modules for:

- Defining things to be `@use`d elsewhere, and
- Outputting CSS code \*

Let's say `foo.scss` defines:
```scss
$fs: italic;
```

It'll get `@use`d in the entry file and subsequently ignored there, but then `bar.scss` can also `@use` it:

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

> \* Modules that output CSS code can still define variables, etc. Just avoid `@use`ing them from other modules, or the CSS might appear in a different order in the output file than what you intended.


## Up Next

Now that you know how to use Mojl in your build scripts, I recommend reading about one way Mojl makes it easy to encapsulate your [frontend scripts](frontend-scripts.md).


---

[< Back to Navigation](index.md#navigation)