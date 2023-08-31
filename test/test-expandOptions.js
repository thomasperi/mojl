/*global describe, it */
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const defaultOptions = require('../src/Options.js');
const expandOptions = require('../src/expandOptions.js');
const CtimeCache = require('../src/CtimeCache.js');

describe(name, async () => {

	it('should add a _cache field', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandOptions();
			assert(actual._cache instanceof CtimeCache);
			delete actual._cache;
		});
	});

	it('should expand an undefined options value', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandOptions();
			delete actual._cache;

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
			delete actual._cache;

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
			delete actual._cache;

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
			delete actual._cache;

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
			delete actual._cache;

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
			delete actual._cache;

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
			delete actual._cache;
			
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
	
	it('should include frontend library when useFrontendLibrary is true', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'project');
			let actual = await expandOptions({
				base: projectBase,
				useFrontendLibrary: true,
				collations: [
					{ modules: ['src/*'] },
					{ modules: ['src/c/d'] },
					{ modules: ['src/c/d/e'] },
				],
			});
			delete actual._cache;
			
			let expected = {
				...defaultOptions,
				base: projectBase,
				useFrontendLibrary: true,
				collations: [
					{
						name: 'site',
						modules: [
							'node_modules/mojl/frontend',
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

});


