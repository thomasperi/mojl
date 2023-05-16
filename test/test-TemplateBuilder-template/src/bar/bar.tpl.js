module.exports = async (mojl, props) => mojl.template`bar ${
	await new Promise(resolve => {
		setTimeout(() => {
			props.log.push('zote');
			resolve('zote');
		}, 20)
	})
} ${
	await new Promise(resolve => {
		setTimeout(() => {
			props.log.push('sbor');
			resolve('sbor');
		}, 0)
	})
}`;