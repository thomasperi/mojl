/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateBuilder = require('../src/TemplateBuilder.js');

describe(name, async () => {

	it('should be true when the module exists', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = new TemplateBuilder(settings);
			assert(builder.exists('src/foo'));
		});
	});

	it('should be true when the module exists as a standalone template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = new TemplateBuilder(settings);
			assert(builder.exists('src/bar'));
		});
	});

	it('should be false when the module does not exist', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = new TemplateBuilder(settings);
			assert(!builder.exists('src/zote'));
		});
	});

});
