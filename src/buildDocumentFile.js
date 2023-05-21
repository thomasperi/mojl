const fs = require("fs");
const path = require("path").posix;

const TemplateHelper = require('./TemplateHelper.js');

async function buildDocumentFile(settings, module) {
	let {
		base,
		buildDevDir,
		buildDistDir,
		templateHomeModule,
		templateOutputSuffix,
		isDev,
	} = settings;
	
	let document = path.relative(
		path.join('/', templateHomeModule), 
		path.join('/', module + templateOutputSuffix)
	);
	
	let builder = new TemplateHelper(settings, document);
	
	// to-do: If module template doesn't exist,
	// back out one directory at a time to find one that does,
	// and pass the extra path nodes as a prop.
	// But maybe do that in a new `produceDocument` method.

	let content = await builder.include(module);
	
	let buildDir = isDev ? buildDevDir : buildDistDir;
	let outputFile = path.join(
		base,
		buildDir,
		document
	);
	
	await fs.promises.mkdir(path.dirname(outputFile), {recursive: true});
	await fs.promises.writeFile(outputFile, content, 'utf8');
}

module.exports = buildDocumentFile;
