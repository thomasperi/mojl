module.exports = (mojl, props) => mojl.template`thed ${props.a} ( ${
	(props.a >= 5) ? 'end' : mojl.include('./thed', {a: props.a + 1})
} )`;