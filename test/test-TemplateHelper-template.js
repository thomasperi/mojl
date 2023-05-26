/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateHelper = require('../src/TemplateHelper.js');

describe(name, async () => {

	it('should wait to resolve promises in template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let log = [];
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/foo', {log});
			let expected = 'foo zote sbor';
			assert.equal(actual, expected);
			assert.deepEqual(log, ['sbor', 'zote']);
		});
	});

	it('should resolve promises in order with async/await', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let log = [];
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/bar', {log});
			let expected = 'bar zote sbor';
			assert.equal(actual, expected);
			assert.deepEqual(log, ['zote', 'sbor']);
		});
	});

});
