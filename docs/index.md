**A bundler for vanilla websites**

This documentation is for the not-yet-stable 2.0.0-alpha.

<img alt="Mojl - Vanilla Bundler"
  src="https://thomasperi.github.io/mojl/mojl-logo-landscape.svg"
  style="width: 100%; border: 1px solid #eee; background: #fafbfc">

## Overview

```console
$ npm i -D mojl
```

Mojl lets you modularize the code for websites that aren't apps, without many of the complexities of modern webapp development.

The CSS and JavaScript code you write is essentially the same code that gets deployed. In a development build, the source files are loaded individually. For production they're concatenated into a single file. Optionally (and recommendedly) you can minify the resulting JS and CSS files.

You can use Mojl as a static site generator directly, or use it to build templates for the SSG or backend framework of your choice.


## Modules

A Mojl "module" is a directory containing files with the same base name as the directory. For example, you might put your site navigation in a module called `nav`: 

```
nav/
  nav.css      <-- The CSS for the nav
  nav.js       <-- The JS for the nav
  nav.tpl.js   <-- The HTML for the nav; see "Templates" below.
```


## Build

By default, Mojl uses all the modules that it finds, recursively, inside the `src` subdirectory of the current working directory.

Example project directory:
```
your-project/
  build.js  <-- Or a gulpfile, or whatever you like.
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

*`build.js`*
```javascript
const Mojl = require('mojl');
const mojl = new Mojl();

mojl.build().then(() => {
  console.log('done');
});
```

Navigate to your project's directory and run your build script:
```console
$ cd your-project
$ node build.js
done
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

A snippet of the `header.css` source file:
```css
.header__logo {
  background-image: url(images/logo.svg);
}
```

The corresponding part of the concatenated `styles.css` file:
```css
.header__logo {
  background-image: url(assets/header/images/logo.svg?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~);
}
```

## Dev Builds

Mojl builds for production by default (except for minification). To build a development site, set the `isDev` option to `true`:

```javascript
mojl.build({isDev: true}).then(() => {
  console.log('done');
});
```

### Development builds differ from production builds in a few ways:

1. Files are written to a `dev` directory instead of `dist`.
2. The `scripts.js` and `styles.css` files each contain code that load the original source files, instead of the concatenated code. This helps ease debugging.
3. Since the original files are used, URLs in CSS files are not rewritten.
4. Other assets are symlinked instead of copied.


## Templates

Templates generate output. You can either use Mojl as a static site generator by writing your templates to output whole HTML pages, or you can write them to output templates for another SSG or backend framework.

Templates found in the `src/home` directory, recursively, are used as entry points for building output files. The output files are written inside `dist` or `dev`, using the  same paths as their modules' locations inside `src/home`.

```
your-project/
  build.js
  dist/
    index.html          <-- Built from src/home/home.tpl.js
    about/index.html    <-- Built from src/home/about/about.tpl.js
    contact/index.html  <-- Built from src/home/contact/contact.tpl.js
    scripts.js
    styles.css
  src/
    home/
      home.css
      home.tpl.js
      about/
        about.css
        about.tpl.js
      contact/
        contact.css
        contact.tpl.js
```

### Native JS Templates

Mojl templates are written using native JS features instead of in a separate template language:

*`your-project/src/hello/hello.tpl.js`*
```javascript
module.exports = (mojl, props) => mojl.template`
  <h1>Hello, ${props.name}!</h1>
`;
```

It's pretty straightforward, but there are a few non-obvious details:

* The `mojl` argument is an object with template-specific methods, not to be confused with a `Mojl` instance.
* The `mojl.template` tag function returns a Promise that resolves to a string. This is so that you can do asynchronous operations inside the template.
* The `props` argument contains whatever value is passed to the template when it is included. By convention this is an object with named properties, but it doesn't have to be.

### Including a Template

```javascript
mojl.include('src/hello', {name: 'World'})
// outputs: <h1>Hello, World!</h1>
```

### "Shell" Pattern

To have multiple pages use the same outer shell, you can simply include the shell and pass the page content to it, along with any other properties that are needed, like the page title.

*`src/shell/shell.tpl.js`*
```javascript
module.exports = (mojl, props) => mojl.template`
<!DOCTYPE html>
<html>
  <head>
    <title>${props.title} | Example Site</title>
  </head>
  <body>
    <header>My Example Site</header>
    <main>
      <h1>${props.title}</h1>
      ${props.content}
    </main>
    <footer>Made with Mojl</footer>
  </body>
</html>
`;
```

*`src/home/home.tpl.js`*
```javascript
module.exports = (mojl, props) => mojl.include('src/shell', {
  title: 'Home',
  content: mojl.template`
    <p>This is the home page.</p>
  `,
});
```

*`src/home/about/about.tpl.js`*
```javascript
module.exports = (mojl, props) => mojl.include('src/shell', {
  title: 'About',
  content: mojl.template`
    <p>This is a page that tells you things about stuff.</p>
  `,
});
```


## CSS Transpilers

to-do


## Options

to-do


## GitHub

https://github.com/thomasperi/mojl


## Pronunciation

/ˈmɑdʒəl/ (MODGE-ul)
