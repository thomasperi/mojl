module.exports = (tpl, props) => tpl`foo(${
	tpl.file('icon.gif', props.options)
})`;