## Modules

A Mojl "module" is a directory containing at least one file with the same base name as the directory. The directory can also contain other files, such as images, used by the module.

> Note: For brevity, each of these examples will only show the files and directories that are relevant to the current topic, not a complete project.

```
foo/
  foo.css
  foo.js
  foo.tpl.js --> the template for outputting HTML (or other) code
  img/
    logo.svg
    photo.jpg
```

Mojl uses all modules in the `src` subdirectory in your project, recursively:

```
example-project/
  src/
    footer/
      footer.css, etc.
    header/
      header.css, etc.
    nav/
      nav.css, etc.
    widgets/
      foo/
        foo.css, etc.
      bar/
        bar.css, etc.
```

The `src/home` module and all the modules nested inside it are used as entry points for producing the HTML files. The path of each module determines where the output file will be written.

```
example-project/
  src/
    home/
      home.tpl.js --> example.com/index.html
      about/
        about.tpl.js --> example.com/about/index.html
        people/
          people.tpl.js --> example.com/about/people/index.html
      contact/
        contact.tpl.js --> example.com/contact/index.html
    widgets/
      foo/
        foo.tpl.js --> not inside home, so doesn't generate a page
```


---

[< Back to Navigation](index.md#navigation)