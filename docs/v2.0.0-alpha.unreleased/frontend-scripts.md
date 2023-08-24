# Frontend Scripts

> to-do: The specific code snippets on this page have not been tested yet.

Mojl is mainly about modularizing the source code itself, but it's a good idea to also write your frontend JavaScript in a way that encapsulates the functionality and state of each module instance. Mojl includes a built-in frontend library for exactly that.

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
/* src/click-counter/click-counter.tpl.js */
module.exports = (tpl, props) => tpl`
  <div class="click-counter">
    <div class="click-counter__name">${props.name}</div>
    <div class="click-counter__display">${props.count}</div>
    <button>increment</button>
  </div>
`;
```

And let's say we have a page displaying multiple counters:

```javascript
/* home/my-counters/my-counters.tpl.js */
module.exports = (tpl, props) => tpl`
  <h1>My Counters</h1>
  ${ tpl.include('src/click-counter', { name: 'Planes', count: 17 }) }
  ${ tpl.include('src/click-counter', { name: 'Trains', count: 5 }) }
  ${ tpl.include('src/click-counter', { name: 'Automobiles', count: 23 }) }
`;
```

Which generates this HTML:

```html
<h1>My Counters</h1>
<div class="click-counter">
  <div class="click-counter__name">Planes</div>
  <div class="click-counter__display">17</div>
  <button>increment</button>
</div>
<div class="click-counter">
  <div class="click-counter__name">Trains</div>
  <div class="click-counter__display">5</div>
  <button>increment</button>
</div>
<div class="click-counter">
  <div class="click-counter__name">Automobiles</div>
  <div class="click-counter__display">23</div>
  <button>increment</button>
</div>
```

Using the `each` method (which is the *only* method at the time of this writing), we can define the counters' behavior in a way that lets each counter operate independently of the others.

```javascript
/* src/click-counter/click-counter.js */
mojl.each('.click-counter', clickCounter => {
  const button = clickCounter.querySelector('button');
  const display = clickCounter.querySelector('.click-counter__display');
  let count = parseInt(display.innerText);
  button.addEventListener('click', () => {
    display.innerText = ++count;
  });
});
```

## What It Does

The `each` method waits for the `DOMContentLoaded` event, then passes each element matching the selector, separately and one at a time, to the callback function you provide. So you can put your scripts in the `<head>` if you want, and it'll still work.

It's roughly equivalent to doing this in jQuery:

```javascript
$(function () {
  $('.click-counter').each(function () {
    // ...
  });
});
```


## That's It for the Guide

(...for now.)

More details are documented on the [API](api.md) page.


---

[< Back to Navigation](index.md#navigation)