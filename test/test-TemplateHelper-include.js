/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const TemplateHelper = require('../src/TemplateHelper.js');

describe(name, async () => {

	it('should include a template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/foo', {a: 1});
			let expected = 'foo(1)';
			assert.equal(actual, expected);
		});
	});

	it('should include a template from a template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/bar', {a: 2});
			let expected = 'bar(foo(2))';
			assert.equal(actual, expected);
		});
	});

	it('should include a template relatively from a template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/zote', {a: 3});
			let expected = 'zote(foo(3))';
			assert.equal(actual, expected);
		});
	});

	it('should include a template relatively from a standalone template', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/sbor', {a: 4});
			let expected = 'sbor(foo(4))';
			assert.equal(actual, expected);
		});
	});

	it('should succeed when stopping exactly at the recursion limit', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				maxIncludeDepth: 5
			});
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src/thed', {a: 1});
			let expected = 'thed 1 ( thed 2 ( thed 3 ( thed 4 ( thed 5 ( end ) ) ) ) )';
			assert.equal(actual, expected);
		});
	});

	it('should throw an exception when exceeding the recursion limit', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				maxIncludeDepth: 4
			});
			let builder = TemplateHelper(settings);
			let actual;
			try {
				actual = await builder.include('src/thed', {a: 1});
			} catch (e) {
				actual = e;
			}
			let expected = 'maxIncludeDepth exceeded (4)';
			assert.equal(actual, expected);
		});
	});

	it('should trim whitespace by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src-trim/foo');
			let expected = 'outer(inner)';
			assert.equal(actual, expected);
		});
	});

	it('should not trim whitespace when trimIncludes is false', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				modules: ['src-trim/*'],
				trimIncludes: false
			});
			let builder = TemplateHelper(settings);
			let actual = await builder.include('src-trim/foo');
			let expected = ' outer( inner ) ';
			assert.equal(actual, expected);
		});
	});

});

