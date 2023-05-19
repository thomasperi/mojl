## Build

Your build script should be located at the top level of your project. It can be a plain Node.js script, a gulpfile, or whatever you like. Here we'll just use a standalone script:

```javascript
/*** example-project/build.js ***/

const Mojl = require('mojl');
const mojl = new Mojl();

mojl.build().then(() => {
  console.log('done');
});
```

Navigate to your project's directory and run your build script:
```console
$ cd example-project
$ node build.js
done
```

Mojl creates a `dist` subdirectory (removing it first if it already exists), concatenates all the CSS and JavaScript into `styles.css` and `scripts.js`, and copies any other files (the site logo in this case) into an `assets` subdirectory:

Before and after build:
```
BEFORE                  :    AFTER
======                  :    =====
                        :
example-project/        :    example-project/
+ build.js              :    + build.js
+ src/                  :    + src/                  <--
  + header/             :    | + header/             <--
  | + header.css        :    | | + header.css        <--
  | + header.tpl.js     :    | | + header.tpl.js     <--
  | + images/           :    | | + images/           <--
  |   + logo.svg        :    | |   + logo.svg        <--
  |   + bg.jpg          :    | |   + bg.jpg          <--
  |                     :    | |                     <--   originals
	+ home/               :    | + home/               <--   unchanged
		+ home.css          :    |   + home.css          <--
		+ home.js           :    |   + home.js           <--
		+ home.tpl.js       :    |   + home.tpl.js       <--
		+ about/            :    |   + about/            <--
			+ about.css       :    |     + about.css       <--
			+ about.js        :    |     + about.js        <--
			+ about.tpl.js    :    |     + about.tpl.js    <--
                        :    |
                        :    + dist/
                        :      + scripts.js  <-- concatenated .js files
                        :      + styles.css  <-- concatenated .css files
                        :      + index.html    <-- built from home.tpl.js
                        :      + about/
                        :      | + index.html  <-- built from about.tpl.js
                        :      |
                        :      + assets/
                        :        + src/
                        :          + header/
                        :            + images/
                        :              + logo.svg  <-- copied from src
                        :              + bg.jpg    <-- copied from src
```

### Relative URLs

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

### Dev Builds

Mojl builds for production by default (except for minification). To build a development site, pass in an object with the `isDev` property set to `true`:

```javascript
mojl.build({isDev: true}).then(() => {
  console.log('done');
});
```

#### Development builds differ from production builds in a few ways:

1. Files are written to a `dev` directory instead of `dist`.
2. The `scripts.js` and `styles.css` files each contain code that load the original source files, instead of the concatenated code. This helps ease debugging.
3. Since the original files are used, URLs in CSS files are not rewritten.
4. Other assets are symlinked instead of copied.
