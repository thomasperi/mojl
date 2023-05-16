/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const devLoaders = require('../src/devLoaders.js');

// These are outside just for the indentation.
//
// Only look for the code that got inserted, so that the templates can change
// without breaking these tests. These tests don't test the loaders themselves,
// only whether the filenames are being inserted into the right template, and the
// templates are easily differentiated by the way the file names are populated.
const expectedPartialJS = `
[
	"one.js",
	"two.js",
	"three.js"
]
`;
const expectedPartialCSS = `
@import "one.css";
@import "two.css";
@import "three.css";
`;

describe(name, async () => {
	it('should build a working loader function for js', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actualJS = (await devLoaders).js({
				urls: [
					'one.js',
					'two.js',
					'three.js',
				],
			});
			assert(actualJS.trim().includes(expectedPartialJS.trim()));
		});
	});

	it('should build a working loader function for css', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actualCSS = (await devLoaders).css({
				urls: [
					'one.css',
					'two.css',
					'three.css',
				],
			});		
			assert(actualCSS.trim().includes(expectedPartialCSS.trim()));
		});
	});

});


