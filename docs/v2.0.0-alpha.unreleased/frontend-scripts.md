# Frontend Scripts

Mojl is mainly about modularizing the source code itself, but it's a good idea to also write your frontend JavaScript in a way that encapsulates the functionality and state of each module instance. Mojl includes a built-in frontend library for doing just that. (This "library" is currently only one small method weighing in at 242 bytes when minified.)

By default, the library is not added to your site (that would be presumptuous), but it's easy to add via the `useFrontendLibrary` option:

```javascript
new Mojl({
  useFrontendLibrary: true,
});
```

> This causes the module `node_modules/mojl/frontend` to be added as the first module in the first (or only) collation. If you want it in a different collation, you can leave `useFrontendLibrary` set to its default `false` and add the module manually instead.

## Usage

Let's use the time-honored example of a counter. Here's the mojl template for the counter:

```javascript
/* src/example-counter/example-counter.tpl.js */
module.exports = (tpl, props) => tpl`
  <div data-mojl="example-counter">
    <div class="example-counter__name">${props.name}</div>
    <div class="example-counter__display">${props.count}</div>
    <button>increment</button>
  </div>
`;
```

On the frontend, using the `mojl.each` method, we can define the behavior of a counter in a way that lets multiple counters operate independently of each other.

```javascript
/* src/example-counter/example-counter.js */
mojl.each('[data-mojl="example-counter"]', exampleCounter => {
  const button = exampleCounter.querySelector('button');
  const display = exampleCounter.querySelector('.example-counter__display');
  let count = parseInt(display.innerText);
  button.addEventListener('click', () => {
    display.innerText = ++count;
  });
});
```

## What Is It Really Doing?

The `each` method waits for the `DOMContentLoaded` event, then passes each element matching the selector, separately and one at a time, to the callback function you provide. So you can put your scripts in the `<head>` if you want, and it'll still work.

It's roughly equivalent to this in jQuery:

```javascript
$(function () {
  $('[data-mojl="example-counter"]').each(function () {
    // ...
  });
});
```


## Publishing Convention

If you publish a Mojl module, it should follow the naming convention illustrated above, to avoid selector collisions.

The outermost HTML tag representing the module should have the attribute `data-mojl="your-package-name"`, where `your-package-name` is the name of the npm package the module is published in.

Your JS and CSS should only select that element and/or elements inside it.

If the npm package contains more than one module -- say, `counter-a` and `counter-b`, distributed as one package, `example-counters`, you can differentiate them by appending the package name with a slash, like: `data-mojl="example-counters/counter-a"`


## That's It for the Guide

(...for now.)

More details are documented on the [API](api.md) page.


---

[< Back to Navigation](index.md#navigation)