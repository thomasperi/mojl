module.exports = (mojl, props) => mojl.template`
<!DOCTYPE html>
<html>
	<head>
		<title>${props.title}</title>
	</head>
	<body>
		<header>Example Site</header>

		${props.content}

		<header>Built with Mojl</header>
	</body>
</html>
`;