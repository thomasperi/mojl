/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const Mojl = require('../src/Mojl.js');

const existingFiles = [
	'src/foo/foo.js',
	'src/zote/bar/bar.js',
	'src/zote/zote.js'
];

describe(name, async () => {

	it('should build dev scripts', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl({isDev: true});
			await mojl.buildScripts();

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dev/site.js'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});
			
		});
	});

	it('should build dist scripts', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
	
			let mojl = new Mojl();
			await mojl.buildScripts();
	
			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dist/site.js'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});
		});
	});

});

