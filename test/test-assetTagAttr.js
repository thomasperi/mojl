/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const assetTagAttr = require('../src/assetTagAttr.js');

const fooHash = '?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~';
const barHash = '?h=Ys23Ag!5IOWqZCw9QGaVDdHwH00~';

describe(name, async () => {

	it('should prepare a dev filename for use in a script tag or stylesheet link tag', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({isDev: true});
			let file = 'test.txt';
			let options = undefined;
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/test.txt' + fooHash;
			assert.equal(actual, expected);
		});
	});

	it('should prepare a dist filename for use in a script tag or stylesheet link tag', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let file = 'test.txt';
			let options = undefined;
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/test.txt' + barHash;
			assert.equal(actual, expected);
		});
	});
	
	it('should omit the hash when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let file = 'test.txt';
			let options = { hash: false };
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/test.txt';
			assert.equal(actual, expected);
		});
	});
	
	it('should encode special html attribute characters', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let file = `<"'&>-test-<"'&>.txt`;
			let options = { hash: false };
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/&lt;&quot;&apos;&amp;&gt;-test-&lt;&quot;&apos;&amp;&gt;.txt';
			assert.equal(actual, expected);
		});
	});
	
	it('should normalize leading slash', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let file = '/test.txt';
			let options = { hash: false };
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/test.txt';
			assert.equal(actual, expected);
		});
	});
	
	it('should resolve the path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let file = 'test/foo/..//./bar.txt';
			let options = { hash: false };
			let currentPage = '/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '/test/bar.txt';
			assert.equal(actual, expected);
		});
	});
	
	it('should relativize when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let file = '/foo/test.txt';
			let options = { hash: false };
			let currentPage = '/bar/zote/index.html';
			let actual = await assetTagAttr(settings, currentPage, file, options);
			let expected = '../../foo/test.txt';
			assert.equal(actual, expected);
		});
	});

});
