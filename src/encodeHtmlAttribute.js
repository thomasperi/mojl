function encodeHtmlAttribute(value) {
	return (value
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	);
}

module.exports = encodeHtmlAttribute;

