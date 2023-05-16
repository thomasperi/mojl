/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const Mojl = require('../src/Mojl.js');

const existingFiles = [
	'fake-transpiler.js',
	'src/foo/foo.css',
	'src/zote/bar/bar.css',
	'src/zote/bar/bar.zazz',
	'src/zote/zote.css'
];

describe(name, async () => {

	it('should build dev styles', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl({isDev: true});
			await mojl.buildStyles();

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dev/styles.css'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});

		});
	});

	it('should build dist styles', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildStyles();

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dist/styles.css'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});

		});
	});

	it('should build dev transpiled styles', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl({
				cssTranspilerAdaptor: './fake-transpiler.js',
				isDev: true
			});
			await mojl.buildStyles();

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dev/styles.css',
					'dev/temp/assets/src/foo/foo.css',
					'dev/temp/assets/src/zote/bar/bar.zazz',
					'dev/temp/assets/src/zote/zote.css',
					'dev/temp/styles.css.zazz'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});
			
		});
	});

	it('should build dist transpiled styles', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl({
				cssTranspilerAdaptor: './fake-transpiler.js'
			});
			await mojl.buildStyles();

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff, {
				created: [
					'dist/styles.css'
				],
				modified: [],
				removed: [],
				unchanged: existingFiles
			});
			
		});
	});

});
