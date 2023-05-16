async function templateTagFn(strings, ...values) {
	const count = values.length;
	let result = '';
	let i = 0;
	while (i < count) {
		let value = values[i];
		if (value instanceof Promise) {
			value = await value;
		}
		result += strings[i] + value;
		i++;
	}
	result += strings[i];
	return result;
}

module.exports = templateTagFn;