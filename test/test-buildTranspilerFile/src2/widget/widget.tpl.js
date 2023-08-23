module.exports = (tpl, props) => tpl`
	<div class="mojl-widget">
		<div>${props.clicks}</div>
		<button>increment</button>
	</div>
`;