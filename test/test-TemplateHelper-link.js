/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateHelper = require('../src/TemplateHelper.js');

describe(name, async () => {

	it('should convert a relative link to absolute', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/foo', {theLink: 'ghi'});
			let expected = 'foo(/abc/def/ghi)';
			assert.equal(actual, expected);
		});
	});

	it('should convert an absolute link to relative', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({pageRelativeUrls: true});
			let builder = TemplateHelper(settings, '/abc/def/index.html');
			let actual = await builder.include('src/foo', {theLink: '/abc/ghi'});
			let expected = 'foo(../ghi)';
			assert.equal(actual, expected);
		});
	});

});

