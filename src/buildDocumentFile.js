const fs = require("fs");
const path = require("path").posix;

const TemplateHelper = require('./TemplateHelper.js');

async function buildDocumentFile(settings, module, props = null, prefix = null) {
	const {
		base,
		buildDevDir,
		buildDistDir,
		templateHomeModule,
		templateOutputSuffix,
		isDev,
	} = settings;
	
	prefix = prefix || path.relative(
		path.join('/', templateHomeModule), 
		path.join('/', module)
	);
	
	const document = path.join('/', prefix + templateOutputSuffix);
	
	const helper = new TemplateHelper(settings, document);
	
	const content = await helper.include(module, props);
	
	if (content !== false) {
		const buildDir = isDev ? buildDevDir : buildDistDir;
		const outputFile = path.join(
			base,
			buildDir,
			document
		);
	
		await fs.promises.mkdir(path.dirname(outputFile), {recursive: true});
		await fs.promises.writeFile(outputFile, content, 'utf8');
	}
	
}

module.exports = buildDocumentFile;
