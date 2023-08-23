module.exports = (tpl, props) => tpl`
<!DOCTYPE html>
<html>
	<head>
		<title>${props.title} | Example Site</title>
		${tpl.styles()}
	</head>
	<body>
	
		<header>
			<div class="sizer">
				Example Site
			</div>
		</header>
		
		<main>
			<div class="sizer">
				<h1>${props.title}</h1>
		
				${props.content}
			</div>
		</main>

		<footer>
			<div class="sizer">
				Built with Mojl
			</div>
		</footer>
		
		${tpl.scripts()}
	</body>
</html>
`;