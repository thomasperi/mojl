module.exports = (mojl, props) => mojl.template`foo(${
	mojl.link(props.theLink)
})`;