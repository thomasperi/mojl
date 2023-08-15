/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const Mojl = require('../src/Mojl.js');

describe(name, async () => {

	it('should build document from named template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildTemplate('foo-page', 'src/foo');

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/foo-page/index.html'
			]);

			assert.equal(after['dist/foo-page/index.html'], 'foo-content');
			
		});
	});

	it('should build document with leading slash', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildTemplate('/foo-page', 'src/foo');

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/foo-page/index.html'
			]);

			assert.equal(after['dist/foo-page/index.html'], 'foo-content');
			
		});
	});

	it('should build document using props', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildTemplate('bar-page', 'src/bar', {zote: 'sbor'});

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/bar-page/index.html'
			]);

			assert.equal(after['dist/bar-page/index.html'], 'bar-sbor');
			
		});
	});

	it('should build document using props and options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl({
				templateOutputSuffix: '.md',
			});
			await mojl.buildTemplate('bar-page-2', 'src/bar', {zote: 'thed'}, {
				isDev: true,
			});

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dev/bar-page-2.md'
			]);

			assert.equal(after['dev/bar-page-2.md'], 'bar-thed');
			
		});
	});

});

