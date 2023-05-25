const fs = require("fs");
const path = require("path").posix;

const TemplateHelper = require('./TemplateHelper.js');

async function buildDocumentFile(settings, module, props = null, document = null) {
	const {
		base,
		buildDevDir,
		buildDistDir,
		templateHomeModule,
		templateOutputSuffix,
		isDev,
	} = settings;
	
	document = document || path.relative(
		path.join('/', templateHomeModule), 
		path.join('/', module + templateOutputSuffix)
	);
	
	document = path.join('/', document);
	
	const helper = new TemplateHelper(settings, document);
	
	const content = await helper.include(module, props);
	
	const buildDir = isDev ? buildDevDir : buildDistDir;
	const outputFile = path.join(
		base,
		buildDir,
		document
	);
	
	await fs.promises.mkdir(path.dirname(outputFile), {recursive: true});
	await fs.promises.writeFile(outputFile, content, 'utf8');
}

module.exports = buildDocumentFile;
