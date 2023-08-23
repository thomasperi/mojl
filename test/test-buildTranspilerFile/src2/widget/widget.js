mojl('.mojl-widget', widget => {
	const button = widget.querySelector('button');
	const readout = widget.querySelector('div');
	let count = readout.innerText;
	button.addEventListener('click', () => {
		readout.innerText = ++count;
	});
});
