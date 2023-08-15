const buildDocumentFile = require('./buildDocumentFile.js');
const findPageModules = require('./findPageModules.js');

async function buildDocumentFilesAll(settings) {
	let modules = await findPageModules(settings);
	modules.sort();
	for (let module of modules) {
		await buildDocumentFile(settings, module);
	}
}

module.exports = buildDocumentFilesAll;
