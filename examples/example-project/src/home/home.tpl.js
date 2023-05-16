const shell = 'src/shell';
const title = 'Home';
module.exports = (mojl, props) => mojl.include(shell, {
	title,
	content: mojl.template`
		<h1>Home</h1>
		<p>Lorem ipsum dolor sit amet</p>
	`
});