module.exports = (tpl, props) => tpl`bar(${tpl.include('src/foo', props)})`;