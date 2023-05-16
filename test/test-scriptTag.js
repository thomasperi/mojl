/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const scriptTag = require('../src/scriptTag.js');

const fooHash = '?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~';
const barHash = '?h=Ys23Ag!5IOWqZCw9QGaVDdHwH00~';

describe(name, async () => {

	it('should generate a script tag with the scripts filename from settings', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let options = undefined;
			let currentPage = '/index.html';
			let actual = await scriptTag(settings, currentPage, options);
			let expected = `<script src="/scripts.js${fooHash}"></script>`;
			assert.equal(actual, expected);
		});
	});

	it('should generate a script tag with the custom scripts filename', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let options = { file: 'custom.js' };
			let currentPage = '/index.html';
			let actual = await scriptTag(settings, currentPage, options);
			let expected = `<script src="/custom.js${barHash}"></script>`;
			assert.equal(actual, expected);
		});
	});

	it('should omit the hash when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let options = { file: 'custom.js', hash: false };
			let currentPage = '/index.html';
			let actual = await scriptTag(settings, currentPage, options);
			let expected = `<script src="/custom.js"></script>`;
			assert.equal(actual, expected);
		});
	});

	it('should relativize when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let options = { file: 'custom.js', hash: false };
			let currentPage = '/foo/index.html';
			let actual = await scriptTag(settings, currentPage, options);
			let expected = `<script src="../custom.js"></script>`;
			assert.equal(actual, expected);
		});
	});

});
