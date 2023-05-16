function standardizeSlashes(path) {
	return ('/' + path + '/').replace(/\/+/g, '/');
}
module.exports = standardizeSlashes;