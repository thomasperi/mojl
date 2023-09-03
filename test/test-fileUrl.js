/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const fileUrl = require('../src/fileUrl.js');

describe(name, async () => {

	it('should by default produce an absolute URL with hash from a template-relative path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentTemplate = path.join(base, 'src/home/foo/foo.tpl.js');
			let currentPage = '/foo/index.html';
			let filePath = 'images/icon.gif';
			let options = undefined;
			let actual = await fileUrl(settings, currentTemplate, currentPage, filePath, options);
			let expected = '/assets/src/home/foo/images/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~';
			assert.equal(actual, expected);
		});
	});

	it('should by default produce an absolute URL with hash from an absolute filesystem path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentTemplate = path.join(base, 'src/home/foo/foo.tpl.js');
			let currentPage = '/foo/index.html';
			let filePath = path.join(base, 'src/home/foo/images/icon.gif');
			let options = undefined;
			let actual = await fileUrl(settings, currentTemplate, currentPage, filePath, options);
			let expected = '/assets/src/home/foo/images/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~';
			assert.equal(actual, expected);
		});
	});

	it('should produce a page-relative URL with hash when pageRelativeUrls option is set', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentTemplate = path.join(base, 'src/home/foo/foo.tpl.js');
			let currentPage = '/foo/index.html';
			let filePath = 'images/icon.gif';
			let options = undefined;
			let actual = await fileUrl(settings, currentTemplate, currentPage, filePath, options);
			let expected = '../assets/src/home/foo/images/icon.gif?h=wyCFiYxuNtNh1LgBcIfekOG4Rlw~';
			assert.equal(actual, expected);
		});
	});

	it('should omit the hash when {hash: false} is passed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentTemplate = path.join(base, 'src/home/foo/foo.tpl.js');
			let currentPage = '/foo/index.html';
			let filePath = 'images/icon.gif';
			let options = { hash: false };
			let actual = await fileUrl(settings, currentTemplate, currentPage, filePath, options);
			let expected = '../assets/src/home/foo/images/icon.gif';
			assert.equal(actual, expected);
		});
	});

});
