## Templates

Templates generate output. You can either use Mojl as a static site generator by having your templates output whole HTML pages, or you can have them output templates for another SSG or backend framework.

Mojl templates are written in JavaScript using native features instead of in a separate template language:

```javascript
/*** src/hello/hello.tpl.js ***/

module.exports = (tpl, props) => tpl`
  <h1>Hello, ${props.name}!</h1>
`; // don't forget the closing backtick!
```

The `tpl` argument is a tag function with additional methods, called a [`TemplateHelper`](api.md#templatehelper).

The `props` argument contains whatever value is passed to the template when it is included. By convention this is an object with named properties, but it doesn't have to be.

### Including a Template

You include a template using the `include` method on the TemplateHelper. The path is relative to the project root, and only needs to include the name of the module directory (`src/hello`), not the template file.

Using the `src/hello` example above:

```javascript
tpl.include('src/hello', {name: 'World'})
// outputs: <h1>Hello, World!</h1>
```

### "Shell" Pattern

To have multiple pages use the same outer shell, you can simply include the shell and pass the page content to it, along with any other properties it will need, like the page title.

```javascript
/*** src/shell/shell.tpl.js ***/

module.exports = (tpl, props) => tpl`
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

```javascript
/*** src/home/home.tpl.js ***/

module.exports = (tpl, props) => tpl.include('src/shell', {
  title: 'Home',
  content: tpl`
    <p>This is the home page.</p>
  `,
});
```

```javascript
/*** src/home/about/about.tpl.js ***/

module.exports = (tpl, props) => tpl.include('src/shell', {
  title: 'About',
  content: tpl`
    <p>This is a page that tells you things about stuff.</p>
  `,
});
```


---

[< Back to Navigation](index.md#navigation)