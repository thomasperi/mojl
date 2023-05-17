**A bundler for vanilla websites**
| [github](https://github.com/thomasperi/mojl)
| [npm](https://www.npmjs.com/package/mojl)

<img src="https://thomasperi.github.io/mojl/mojl-logo-landscape.svg"
  alt="Mojl - Vanilla Bundler" 
  style="width: 100%; border-top: 1px solid #eee; border-bottom: 1px solid #eee">

## Overview

This documentation is for the not-yet-stable 2.0.0-alpha.

Mojl lets you modularize the code for websites that aren't apps, without many of the complexities of modern webapp development.

The CSS and JavaScript code you write is essentially the same code that gets deployed. In a development build, the source files are loaded individually. On production they're concatenated into a single file. Optionally (and recommendedly) you can minify the resulting JS and CSS files.

You can use Mojl as a static site generator directly, or use it to build templates for the SSG or backend framework of your choice.


## Modules

A Mojl "module" is a directory containing files with the same base name as the directory. For example, you might put your site navigation in a module called `site-nav`: 

```
site-nav/
  site-nav.css      <-- The CSS for the nav
  site-nav.js       <-- The JS for the nav
  site-nav.tpl.js   <-- The HTML for the nav; see "Templates" below.
```


## Build

By default, Mojl uses all the modules that it finds, recursively, inside the `src` subdirectory of the current working directory.

Example project directory:
```
your-project/
  build.js
  src/
    footer/
      footer.css
      footer.tpl.js
    header/
      header.css
      header.tpl.js
      images/
        logo.svg
    widgets/
      calculator/
        calculator.css
        calculator.js
        calculator.tpl.js
```

build.js:
```javascript
const Mojl = require('mojl');
const mojl = new Mojl();

mojl.build().then(() => {
  console.log('done');
});
```

Navigate to the project directory and run the build script:
```console
$ cd your-project
$ node build.js
done
$
```

Mojl creates a `dist` subdirectory (removing it if it already exists), concatenates all the CSS and JavaScript into `styles.css` and `scripts.js`, and mirrors any other files (the site logo in this case) into an `assets` subdirectory:

```
your-project/
  build.js
  dist/
    assets/
      header/
        images/
          logo.svg
    scripts.js
    styles.css
  src/
    (contents unchanged)
```


## Relative URLs

Relative URLs in CSS files are automatically rewritten to be relative to the concatenated file, and appended with a hash for cache-busting.

A snippet of the header.css source file:
```css
.header__site-logo {
  background-image: url(images/logo.svg);
}
```

The corresponding part of the concatenated styles.css file:
```css
.header__site-logo {
  background-image: url(assets/header/images/logo.svg?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~);
}
```

## Templates

A module's `.tpl.js` file outputs the HTML code for the module. It's easier to start with what it looks like and then explain what's going on:

example-h1.tpl.js
```javascript
module.exports = (mojl, props) => mojl.template`
  <h1>${props.text}</h1>
`;
```

* The template file is a Node module that exports a function.
* That function should expect two parameters:
  * The `mojl` parameter is an object with helper methods (not to be confused with a `Mojl` instance).
  * The `props` parameter contains the value passed to the module when it was included.
* The function should return a Promise that resolves to a string.

### `mojl.template`

The easiest way to return that promise is via the `mojl.template` tag function. If any of the expressions in its template literal evaluate to a Promise, the value that the Promise resolves to is used.

### `mojl.include`

You can include another module's template from inside a template. You refer to the template by its module name, not its full filename. The module path is relative to the project root.

example-section.tpl.js
```javascript
module.exports = (mojl, props) => mojl.template`
  <section>
    ${mojl.include('src/example-h1', { text: props.heading })}
    <p>${props.body}</p>
  </section>
`;
```

## Dev Build

to-do


## CSS Transpilers

to-do


## Options

to-do


## Pronunciation

/ˈmɑdʒəl/ (MODGE-ul)
