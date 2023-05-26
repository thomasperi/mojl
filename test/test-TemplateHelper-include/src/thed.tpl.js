module.exports = (tpl, props) => tpl`thed ${props.a} ( ${
	(props.a >= 5) ? 'end' : tpl.include('./thed', {a: props.a + 1})
} )`;