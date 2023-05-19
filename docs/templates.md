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