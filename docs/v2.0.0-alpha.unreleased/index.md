*A bundler for vanilla websites*

This documentation is for the not-yet-stable 2.0.0-alpha.

<img alt="Mojl - Vanilla Bundler"
  src="https://thomasperi.github.io/mojl/mojl-logo-landscape.svg"
  style="width: 100%; border: 1px solid #eee; background: #fafbfc">

## Overview

Mojl lets you compartmentalize the files for websites that aren't apps, without many of the complexities of modern webapp development.

The CSS and JavaScript code you write is essentially the same code that gets deployed. In a development build, the source files are loaded individually. For production they're concatenated into a single file. Optionally (and recommendedly) you can minify the resulting JS and CSS files using the minifiers of your choice.

It can also serve as a static site generator, or generate templates for a separate SSG or backend framework.


## Why?

(1) **Intuitive Organization:** With Mojl you can organize files according to which module uses them, rather than having the bits and pieces of each module strewn across multiple directories among the rest of the pieces of the site. (Or even worse, writing all the JavaScript or CSS for the whole site in one 20,000-line file.)

```
So your files can         Instead of 
look like this...         like this...

calculator/               images/
  calculator.css            carousel-next.svg
  calculator.js             carousel-prev.svg
  calculator.tpl.js         header-logo.svg
carousel/                   header-background.jpg
  carousel.css            scripts/
  carousel.js               calculator.js
  carousel.tpl.js           carousel.js
  images/                   nav.js
    next.svg              styles/
    prev.svg                calculator.css
footer/                     carousel.css
  footer.css                footer.css
  footer.tpl.js             header.css
header/                     html.css
  header.css                nav.css
  header.tpl.js           templates/
  logo.svg                  calculator.tpl
  background.jpg            carousel.tpl
html/                       footer.tpl
  html.css                  header.tpl
  html.tpl.js               html.tpl
nav/                        nav.tpl
  nav.css
  nav.js
  nav.tpl.js
```

(2) **Code Reuse**: An added benefit of having each module in its own directory is that it can be published to npm and reused without manually copying individual files to their proper places in the filesystem.


## Links
* Mojl on GitHub: <https://github.com/thomasperi/mojl/tags>
* Mojl on npm: <https://www.npmjs.com/package/mojl?activeTab=versions>

## Pronunciation
/ˈmɑdʒəl/ (MODGE-ul)


## Navigation

Each page in this documentation is listed here. At the bottom of each page is a link that leads back to this list.

* [Modules](modules.md)
* [Build](build.md)
* [Templates](templates.md)
* [Transpilers](transpilers.md)
* [API](api.md)