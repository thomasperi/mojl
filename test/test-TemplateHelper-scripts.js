/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateHelper = require('../src/TemplateHelper.js');

const fooHash = '?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~';
// const barHash = '?h=Ys23Ag!5IOWqZCw9QGaVDdHwH00~';

describe(name, async () => {

	it('should generate a script tag with the scripts filename from settings', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let builder = TemplateHelper(settings, currentPage);
			let actual = await builder.include('src/no-args');
			let expected = `<script src="/site.js${fooHash}"></script>`;
			assert.equal(actual, expected);
		});
	});

	it('should omit the hash when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let builder = TemplateHelper(settings, currentPage);
			let actual = await builder.include('src/collations-null-hash-false');
			let expected = `<script src="/site.js"></script>`;
			assert.equal(actual, expected);
		});
	});
	
	it('should use collations in settings', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				collations: [
					// The modules described here don't need to actually exist on the filesystem for this test
					{ name: 'one', modules: ['src/one/*'] },
					{ name: 'two', modules: ['src/two/*'] },
				]
			});
			let currentPage = '/index.html';
			let builder = TemplateHelper(settings, currentPage);
			let actual = await builder.include('src/collations-null-hash-false');
			let expected = `<script src="/one.js"></script><script src="/two.js"></script>`;
			assert.equal(actual, expected);
		});
	});
	
	it('should use explicit collations', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let builder = TemplateHelper(settings, currentPage);
			let actual = await builder.include('src/collations-explicit-hash-false');
			let expected = `<script src="/aaa.js"></script><script src="/bbb.js"></script>`;
			assert.equal(actual, expected);
		});
	});
	
	it('should relativize when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/index.html';
			let builder = TemplateHelper(settings, currentPage);
			let actual = await builder.include('src/collations-null-hash-false');
			let expected = `<script src="../site.js"></script>`;
			assert.equal(actual, expected);
		});
	});

});
