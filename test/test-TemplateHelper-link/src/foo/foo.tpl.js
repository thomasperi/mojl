module.exports = (tpl, props) => tpl`foo(${
	tpl.link(props.theLink)
})`;