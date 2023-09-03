/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const relativizeCssUrls = require('../src/relativizeCssUrls.js');
const expandOptions = require('../src/expandOptions.js');

describe(name, async () => {

	it('should relativize css urls', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let assetList = [];
			let cssSourceFile = path.join(base, 'src/foo/foo.css');
			let cssDestFile = path.join(base, 'destination/site.css');
			let baseDest = path.join(base, 'destination/mirror');
			let cssCode = fs.readFileSync(cssSourceFile, 'utf8');
			
			let expected = '#foo{ background: url(mirror/src/foo/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~) }';
			let actual = await relativizeCssUrls(
				settings,
				cssCode,
				cssSourceFile,
				cssDestFile,
				baseDest,
				assetList
			);
			
			assert.equal(actual, expected);
			assert.deepEqual(assetList, [
				'src/foo/icon.gif'
			]);
		});
	});

});


