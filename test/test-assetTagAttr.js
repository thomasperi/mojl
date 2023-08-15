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
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['test'];
			let options = undefined;
			
			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/test.txt' + fooHash];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should prepare a dist filename for use in a script tag or stylesheet link tag', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['test'];
			let options = undefined;

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/test.txt' + barHash];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should omit the hash when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['test'];
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/test.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should provide multiple urls for multiple collations', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['aaa', 'bbb'];
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/aaa.txt', '/bbb.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should use default collation from when not explicit', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = undefined;
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/site.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should treat null collations the same as undefined', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = null; // undefined tested in previous test
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/site.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should use collations from settings when not explicit', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				collations: [
					{ name: 'one', modules: ['src/one/*'] },
					{ name: 'two', modules: ['src/two/*'] },
					{ name: 'three', modules: ['src/three/*'] },
				],
			});
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = undefined;
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/one.txt', '/two.txt', '/three.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should encode special html attribute characters', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = [`<"'&>-test-<"'&>`]; // unrealistic, but test it anyway
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/&lt;&quot;&apos;&amp;&gt;-test-&lt;&quot;&apos;&amp;&gt;.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should normalize leading slash', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['/test'];
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/test.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should resolve the path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/index.html';
			let type = 'txt';
			let collations = ['test/foo/..//./bar'];
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['/test/bar.txt'];
			assert.deepEqual(actual, expected);
		});
	});
	
	it('should relativize when specified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/bar/zote/index.html';
			let type = 'txt';
			let collations = ['foo/test'];
			let options = { hash: false };

			let actual = await assetTagAttr(settings, currentPage, type, collations, options);
			let expected = ['../../foo/test.txt'];
			assert.deepEqual(actual, expected);
		});
	});

});
