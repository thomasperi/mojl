const fs = require("fs");
const path = require("path").posix;

const TemplateHelper = require('./TemplateHelper.js');
// const isInside = require('./isInside.js');

async function buildDocumentFile(settings, module, props = null, prefix = null) {
	const {
		base,
		buildDevDir,
		buildDistDir,
		templateHomeModule,
		templateOutputSuffix,
		isDev,
	} = settings;
	
	if (typeof prefix !== 'string') {
		prefix = path.relative(
			path.join('/', templateHomeModule), 
			path.join('/', module)
		);
	}
	
	const document = path.join('/', prefix + templateOutputSuffix);
	const buildDirPath = path.join(base, (isDev ? buildDevDir : buildDistDir));
	const outputFile = path.join(buildDirPath, document);

	// if (!isInside(outputFile, buildDirPath)) {
	// 	throw `Can't create a document outside build directory (${document})`;
	// }
	
	const helper = TemplateHelper(settings, document);
	const content = await helper.include(module, props);
	
	if (content !== false) {
		await fs.promises.mkdir(path.dirname(outputFile), {recursive: true});
		await fs.promises.writeFile(outputFile, content, 'utf8');
	}
	
}

module.exports = buildDocumentFile;
