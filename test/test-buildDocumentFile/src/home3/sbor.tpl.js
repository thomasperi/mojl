// Returns false if props is falsy, or the normal promise if not.
// This lets templates that generate documents based on props
// decline to write if props aren't present, such as in buildTemplatesAuto.
module.exports = (tpl, props) => !!props && tpl`>>>${props.foo}<<<`;