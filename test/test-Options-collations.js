/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildMonolithFile = require('../src/buildMonolithFile.js');
const buildDevLoaderFile = require('../src/buildDevLoaderFile.js');

const options = {
	collations: [
		{ name: 'one', modules: ['src/collation1/**'] },
		{ name: 'two', modules: ['src/collation2/**'] },
	],
};

describe(name, async () => {

	it('should collate monoliths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions(options);
			
			await buildMonolithFile(settings, 'css');
			await buildMonolithFile(settings, 'js');
			
			let after = box.snapshot();

			assert.equal(after["dist/one.css"], ".d{--d:4}.e{--e:5}.f{--f:6;background:url(assets/src/collation1/f/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~)}");
			assert.equal(after["dist/one.js"], "function d(){console.log(\"d\")}function e(){console.log(\"e\")}function f(){console.log(\"f\")}");
			assert.equal(after["dist/two.css"], ".g{--g:7}.h{--h:8}.i{--i:9;background:url(assets/src/collation2/i/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~)}");
			assert.equal(after["dist/two.js"], "function g(){console.log(\"g\")}function h(){console.log(\"h\")}function i(){console.log(\"i\")}");
		});
	});

	it('should collate dev loaders', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions(options);
			
			await buildDevLoaderFile(settings, 'css');
			await buildDevLoaderFile(settings, 'js');
			
			let after = box.snapshot();
			
			assert(after["dev/one.css"].includes('@import "assets/src/collation1/d/d.css";\n@import "assets/src/collation1/e/e.css";\n@import "assets/src/collation1/f/f.css";'));
			assert(after["dev/one.js"].includes('[\n\t"assets/src/collation1/d/d.js",\n\t"assets/src/collation1/e/e.js",\n\t"assets/src/collation1/f/f.js"\n]'));
			assert(after["dev/two.css"].includes('@import "assets/src/collation2/g/g.css";\n@import "assets/src/collation2/h/h.css";\n@import "assets/src/collation2/i/i.css";'));
			assert(after["dev/two.js"].includes('[\n\t"assets/src/collation2/g/g.js",\n\t"assets/src/collation2/h/h.js",\n\t"assets/src/collation2/i/i.js"\n]'));

		});
	});
	
	// to-do: test collating transpiler files

	it('should collate pages when building monoliths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				...options,
				collations: [ { modules: ['src/**'] } ],
				collatePages: true,
			});
			
			// 			console.log(JSON.stringify({settings}, null, 2));
			
			await buildMonolithFile(settings, 'css');
			await buildMonolithFile(settings, 'js');
			
			// let after = box.snapshot();
			// 			console.log(JSON.stringify({after}, null, 2));
			
			// to-do: finish writing this test
			
			// assert(after["dev/one.css"].includes('@import "assets/src/collation1/d/d.css";\n@import "assets/src/collation1/e/e.css";\n@import "assets/src/collation1/f/f.css";'));
			// assert(after["dev/one.js"].includes('[\n\t"assets/src/collation1/d/d.js",\n\t"assets/src/collation1/e/e.js",\n\t"assets/src/collation1/f/f.js"\n]'));
			// assert(after["dev/two.css"].includes('@import "assets/src/collation2/g/g.css";\n@import "assets/src/collation2/h/h.css";\n@import "assets/src/collation2/i/i.css";'));
			// assert(after["dev/two.js"].includes('[\n\t"assets/src/collation2/g/g.js",\n\t"assets/src/collation2/h/h.js",\n\t"assets/src/collation2/i/i.js"\n]'));

		});
	});
	
});
