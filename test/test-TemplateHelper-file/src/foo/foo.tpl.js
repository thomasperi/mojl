module.exports = (mojl, props) => mojl.template`foo(${
	mojl.file('icon.gif', props.options)
})`;