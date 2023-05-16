/*global describe, it */
const assert = require('assert');
// const fs = require('fs');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const linkUrl = require('../src/linkUrl.js');

describe(name, async () => {

	it('should absolutize relative URLs by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/foo/bar/zote/index.html';
			let url = '../../sbor/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '/foo/sbor/';
			assert.equal(actual, expected);
		});
	});

	it('should keep relative URLs relative if pageRelativeUrls option is set', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/bar/zote/index.html';
			let url = '../../sbor/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '../../sbor/';
			assert.equal(actual, expected);
		});
	});

	it('should keep site-relative URLs site-relative by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/foo/bar/zote/index.html';
			let url = '/sbor/thed/sneg/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '/sbor/thed/sneg/';
			assert.equal(actual, expected);
		});
	});

	it('should relativize absolute URLs if pageRelativeUrls option is set', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/bar/zote/index.html';
			let url = '/foo/sbor/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '../../sbor/';
			assert.equal(actual, expected);
		});
	});

	it('should keep scheme-relative URLs scheme-relative by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/foo/bar/zote/index.html';
			let url = '//example.com/sbor/thed/sneg/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '//example.com/sbor/thed/sneg/';
			assert.equal(actual, expected);
		});
	});

	it('should keep scheme-relative URLs scheme-relative even if pageRelativeUrls option is set', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/bar/zote/index.html';
			let url = '//example.com/sbor/thed/sneg/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '//example.com/sbor/thed/sneg/';
			assert.equal(actual, expected);
		});
	});

	it('should keep full URLs full by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/foo/bar/zote/index.html';
			let url = 'https://example.com/sbor/thed/sneg/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = 'https://example.com/sbor/thed/sneg/';
			assert.equal(actual, expected);
		});
	});

	it('should keep full URLs full even if pageRelativeUrls option is set', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/bar/zote/index.html';
			let url = 'https://example.com/sbor/thed/sneg/';
			let actual = linkUrl(settings, currentPage, url);
			let expected = 'https://example.com/sbor/thed/sneg/';
			assert.equal(actual, expected);
		});
	});

	it('should preserve absence of tail slash in absolutized URLs', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let currentPage = '/foo/bar/zote/index.html';
			let url = '../../sbor';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '/foo/sbor';
			assert.equal(actual, expected);
		});
	});

	it('should preserve absence of tail slash in relativized URLs', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let currentPage = '/foo/bar/zote/index.html';
			let url = '/foo/sbor';
			let actual = linkUrl(settings, currentPage, url);
			let expected = '../../sbor';
			assert.equal(actual, expected);
		});
	});

});
