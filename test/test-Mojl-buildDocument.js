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
			await mojl.buildDocument('foo-page.html', 'src/foo');

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/foo-page.html'
			]);

			assert.equal(after['dist/foo-page.html'], 'foo-content');
			
		});
	});

	it('should build document using props', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildDocument('bar-page.html', 'src/bar', {zote: 'sbor'});

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/bar-page.html'
			]);

			assert.equal(after['dist/bar-page.html'], 'bar-sbor');
			
		});
	});

	it('should build document using props and options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildDocument('bar-page-2.html', 'src/bar', {zote: 'thed'}, {
				isDev: true
			});

			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dev/bar-page-2.html'
			]);

			assert.equal(after['dev/bar-page-2.html'], 'bar-thed');
			
		});
	});

});

