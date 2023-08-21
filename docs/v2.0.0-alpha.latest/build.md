## Build

Your build script should be located at the top level of your project. It can be a plain Node.js script, a gulpfile, or whatever you like.

```javascript
/*** example-project/build.js ***/

const Mojl = require('mojl');
const mojl = new Mojl();

mojl.build().then(() => {
  console.log('done');
});
```

Navigate to your project's directory (that `cd` is important, because Mojl uses the working directory as the project root by default) and run your build script:

```console
$ cd example-project
$ node build.js
done
```

Mojl creates a `dist` subdirectory (removing it first if it already exists), concatenates all the `<module>.css` and `<module>.js` files into `site.css` and `site.js`, and copies any other files into an `assets` subdirectory:

Before and after build:
```
example-project/        >   example-project/
  build.js              >     build.js
  src/                  >     src/    -- existing src directory, unchanged
    shell/              >       
      shell.css         >     dist/   -- new build directory
      shell.tpl.js      >       site.js     -- concatenated .js files
      images/           >       site.css     -- concatenated .css files
        logo.svg        >       index.html     -- built from home.tpl.js
        bg.jpg          >       about/
    home/               >         index.html   -- built from about.tpl.js
      home.css          >       assets/
      home.js           >         src/
      home.tpl.js       >           shell/
      about/            >             images/
        about.css       >               logo.svg    -- copied
        about.js        >               bg.jpg      -- copied
        about.tpl.js    >
```

### Relative URLs

Relative URLs in CSS files are automatically rewritten to be relative to the concatenated file, and appended with a hash for cache-busting.

A snippet of the `shell.css` source file:
```css
.header__logo {
  background-image: url(images/logo.svg);
}
```

The corresponding part of the concatenated `site.css` file:
```css
.header__logo {
  background-image: url(assets/shell/images/logo.svg?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~);
}
```

### Dev Builds

Mojl builds for production by default. To build a development site, pass in an object with the `isDev` property set to `true`:

```javascript
mojl.build({isDev: true}).then(() => {
  console.log('done');
});
```

#### Development builds differ from production builds in a few ways:

1. Files are written to a `dev` directory instead of `dist`.
2. The `site.js` and `site.css` files each contain code that load the original source files, instead of the concatenated code. This helps ease debugging.
3. Since the modules' original directory structure is used, URLs in CSS files are not rewritten.
4. Other assets are symlinked (where supported) instead of copied.


## Up Next

See how [Templates](templates.md) are constructed in the next section.


---

[< Back to Navigation](index.md#navigation)