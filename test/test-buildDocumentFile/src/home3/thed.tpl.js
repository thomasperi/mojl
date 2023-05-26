// returns false if props is falsy, or the normal promise if not.
module.exports = (mojl, props) => !!props && mojl.template`>>>${props.foo}<<<`;