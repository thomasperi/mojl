const fs = require("fs");
const path = require("path").posix;

const buildDocumentFile = require('./buildDocumentFile.js');

const extension = /\.tpl\.js$/;
const doubleEnd = /(\/.+?)\1$/;

async function buildDocumentFilesAll(settings) {
	let {
		base,
		templateHomeModule,
	} = settings;
	
	let modules = (await findAllTemplateModules(path.join(base, templateHomeModule))).map(
		module => path.relative(base, module)
	);
	modules.sort();
	for (let module of modules) {
		await buildDocumentFile(settings, module);
	}
}

async function findAllTemplateModules(dir, found = []) {
	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
		return found;
	}
	for (let item of await fs.promises.readdir(dir)) {
		if (item === '.' || item === '..') {
			continue;
		}
		let itemPath = path.join(dir, item);
		let stat = fs.statSync(itemPath);
		if (stat.isDirectory()) {
			await findAllTemplateModules(itemPath, found);
		} else if (stat.isFile() && extension.test(itemPath)) {
			let module = itemPath.replace(extension, '');
			if (doubleEnd.test(module)) {
				module = module.replace(doubleEnd, '$1');
			}
			found.push(module);
		}
	}
	return found;
}

module.exports = buildDocumentFilesAll;
