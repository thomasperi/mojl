const shell = 'src/shell';
const title = 'Home';
module.exports = (tpl, props) => tpl.include(shell, {
	title,
	content: tpl`
		<p>Lorem ipsum dolor sit amet</p>
		${tpl.include('src/widget', {clicks: 5})}
		${tpl.include('src/widget', {clicks: 23})}
	`
});