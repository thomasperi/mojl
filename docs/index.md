*A bundler for vanilla websites*

This documentation is for the not-yet-stable 2.0.0-alpha.

<img alt="Mojl - Vanilla Bundler"
  src="https://thomasperi.github.io/mojl/mojl-logo-landscape.svg"
  style="width: 100%; border: 1px solid #eee; background: #fafbfc">


## Overview

Mojl lets you modularize the code and assets for websites that aren't apps, without many of the complexities of modern webapp development.

The CSS and JavaScript code you write is essentially the same code that gets deployed. In a development build, the source files are loaded individually. For production they're concatenated into a single file. Optionally (and recommendedly) you can minify the resulting JS and CSS files using the minifiers of your choice.

You can use Mojl as a static site generator directly, or use it to build templates for another SSG or backend framework.

### GitHub
<https://github.com/thomasperi/mojl>

### npm
<https://www.npmjs.com/package/mojl>

### Pronunciation
/ˈmɑdʒəl/ (MODGE-ul)


## Navigation

* [Modules](modules.md)
* [Build](build.md)
* [Templates](templates.md)
* [Transpilers](transpilers.md)
* [API](api.md)