/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildDocumentFile = require('../src/buildDocumentFile.js');

describe(name, async () => {

	it('should build a file from a template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({isDev: true});
			let module = 'src/home';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);
			
			assert.deepEqual(created, ['dev/index.html']);
			assert.equal(after['dev/index.html'], '(home)');
		});
	});

	it('should build in the dist directory when isDev is false', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions();
			let module = 'src/home';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dist/index.html']);
			assert.equal(after['dist/index.html'], '(home)');
		});
	});

	it('should build another file from another template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({isDev: true});
			let module = 'src/home/about';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dev/about/index.html']);
			assert.equal(after['dev/about/index.html'], '(about)');
		});
	});
	
	it('should honor the templateHomeModule option', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({
				templateHomeModule: 'src/home2',
				isDev: true,
			});
			let module = 'src/home2/about';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dev/about/index.html']);
			assert.equal(after['dev/about/index.html'], '(about 2)');
		});
	});
	
	it('should honor the templateOutputSuffix option', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({
				templateOutputSuffix: '.html',
				isDev: true,
			});
			let module = 'src/home/about';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dev/about.html']);
			assert.equal(after['dev/about.html'], '(about)');
		});
	});
	
	it('should resolve a standalone template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({isDev: true});
			let module = 'src/home/contact';
			await buildDocumentFile(settings, module);
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dev/contact/index.html']);
			assert.equal(after['dev/contact/index.html'], '(contact)');
		});
	});

	it('should use props and document when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions();
			let module = 'src/home3/sbor';
			await buildDocumentFile(settings, module, {foo: 'bar'}, 'zote/sbor');
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, ['dist/zote/sbor/index.html']);
			assert.equal(after['dist/zote/sbor/index.html'], '>>>bar<<<');
		});
	});

	it('should not write a file when template returns false', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions();
			let module = 'src/home3/sbor';
			await buildDocumentFile(settings, module, null, 'zote/sbor');
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, []);
		});
	});

	it('should handle no-slash-suffix edge case in an arbitrary but predictable way', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({
				templateOutputSuffix: '.html'
			});
			let module = 'src/home3/sbor';
			await buildDocumentFile(settings, module, {foo: 'bar'}, '');
			await buildDocumentFile(settings, module, {foo: 'zote'}, 'sbor');
			
			let after = box.snapshot();
			let {created} = box.diff(before, after);

			// The home page gets rendered as the suffix itself even if it starts with a dot.
			assert.deepEqual(created, [
				'dist/.html',
				'dist/sbor.html',
			]);
			assert.equal(after['dist/.html'], '>>>bar<<<');
			assert.equal(after['dist/sbor.html'], '>>>zote<<<');
		});
	});

});


