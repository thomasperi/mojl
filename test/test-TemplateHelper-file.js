/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateHelper = require('../src/TemplateHelper.js');

describe(name, async () => {

	it('should reference a relative path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/foo');
			let expected = 'foo(/assets/src/foo/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)';
			assert.equal(actual, expected);
		});
	});

	it('should reference a relative path without hash', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/foo', {options: {hash: false}});
			let expected = 'foo(/assets/src/foo/icon.gif)';
			assert.equal(actual, expected);
		});
	});

	it('should reference a relative path as a page-relative url', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/foo', {options: {hash: false}});
			let expected = 'foo(../../assets/src/foo/icon.gif)';
			assert.equal(actual, expected);
		});
	});

	it('should reference a relative path outside the current module', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/bar');
			let expected = 'bar(/assets/src/foo/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)';
			assert.equal(actual, expected);
		});
	});

	it('should reference a relative path outside the current module as a page-relative url', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/bar');
			let expected = 'bar(../../assets/src/foo/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)';
			assert.equal(actual, expected);
		});
	});

	it('should reference an absolute path', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/zote');
			let expected = 'zote(/assets/src/foo/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)';
			assert.equal(actual, expected);
		});
	});

	it('should reference an absolute path as a page-relative url', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({ pageRelativeUrls: true });
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/zote');
			let expected = 'zote(../../assets/src/foo/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)';
			assert.equal(actual, expected);
		});
	});

});

