module.exports = (tpl, props) => tpl`foo ${
	new Promise(resolve => {
		setTimeout(() => {
			props.log.push('zote');
			resolve('zote');
		}, 20)
	})
} ${
	new Promise(resolve => {
		setTimeout(() => {
			props.log.push('sbor');
			resolve('sbor');
		}, 0)
	})
}`;