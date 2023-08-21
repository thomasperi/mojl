/*global describe, it */
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const defaultOptions = require('../src/Options.js');
const expandOptions = require('../src/expandOptions.js');

describe(name, async () => {

	it('should expand an undefined options value', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandOptions();
			let expected = {
				...defaultOptions,
				base,
				collations: [ { name: 'site', modules: [] } ], // because patterns get expanded and there isn't a 'src' dir in base
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should expand an empty options value', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandOptions({});
			let expected = {
				...defaultOptions,
				base,
				collations: [ { name: 'site', modules: [] } ],
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should ignore unknown options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandOptions({ foo: 'bar' });
			let expected = {
				...defaultOptions,
				base,
				collations: [ { name: 'site', modules: [] } ],
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should override defaults with supplied options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'foo');
			let actual = await expandOptions({
				base: projectBase,
			});
			let expected = {
				...defaultOptions,
				base: projectBase,
				collations: [ { name: 'site', modules: [] } ],
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should expand module patterns into module paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'project');
			let actual = await expandOptions({
				base: projectBase,
			});
			let expected = {
				...defaultOptions,
				base: projectBase,
				collations: [ {
					name: 'site',
					modules: [
						'src',
						'src/a',
						'src/b',
						'src/c',
						'src/c/d',
						'src/c/d/e',
					]
				} ],
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should assign names to nameless collations', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'project');
			let actual = await expandOptions({
				base: projectBase,
				collations: [
					{ modules: ['src/*'] },
					{ modules: ['src/c/d'] },
					{ modules: ['src/c/d/e'] },
				],
			});
			let expected = {
				...defaultOptions,
				base: projectBase,
				collations: [
					{
						name: 'site',
						modules: [
							'src/a',
							'src/b',
							'src/c',
						]
					},
					{
						name: 'site-1',
						modules: [
							'src/c/d',
						]
					},
					{
						name: 'site-2',
						modules: [
							'src/c/d/e',
						]
					},
				],
			};
			assert.deepEqual(actual, expected);
		});
	});

	it('should allow changing the default collation name', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'project');
			let actual = await expandOptions({
				base: projectBase,
				collationNamePrefix: 'foo',
				collations: [
					{ modules: ['src/*'] },
					{ modules: ['src/c/d'] },
					{ modules: ['src/c/d/e'] },
				],
			});
			
			let expected = {
				...defaultOptions,
				base: projectBase,
				collationNamePrefix: 'foo',
				collations: [
					{
						name: 'foo',
						modules: [
							'src/a',
							'src/b',
							'src/c',
						]
					},
					{
						name: 'foo-1',
						modules: [
							'src/c/d',
						]
					},
					{
						name: 'foo-2', 
						modules: [
							'src/c/d/e',
						]
					},
				],
			};

			assert.deepEqual(actual, expected);
		});
	});

});


