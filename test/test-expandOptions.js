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
				collations: { site: [] }, // because patterns get expanded and there isn't a 'src' dir in base
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
				collations: { site: [] },
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
				collations: { site: [] },
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
				collations: { site: [] },
			};
			assert.deepEqual(actual, expected);
		});
	});

	// Removed for option type strictness
	// it('should force values to strings', async () => {
	// 	await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
	// 		let projectBase = path.join(base, 'foo');
	// 		let actual = await expandOptions({
	// 			base: projectBase,
	// 			buildDevDir: false,
	// 			buildDistDir: undefined,
	// 		});
	// 		let expected = {
	// 			...defaultOptions,
	// 			base: projectBase,
	// 			modules: [],
	// 			buildDevDir: 'false',
	// 			buildDistDir: 'undefined',
	// 		};
	// 		assert.deepEqual(actual, expected);
	// 	});
	// });

	it('should expand module patterns into module paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'project');
			let actual = await expandOptions({
				base: projectBase,
			});
			let expected = {
				...defaultOptions,
				base: projectBase,
				collations: { site: [
					'src',
					'src/a',
					'src/b',
					'src/c',
					'src/c/d',
					'src/c/d/e',
				] },
			};
			assert.deepEqual(actual, expected);
		});
	});

	// Removed for option type strictness
	// it('should wrap string `modules` option in array', async () => {
	// 	await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
	// 		let projectBase = path.join(base, 'project');
	// 		let actual = await expandOptions({
	// 			base: projectBase,
	// 			modules: 'src/*',
	// 		});
	// 		let expected = {
	// 			...defaultOptions,
	// 			base: projectBase,
	// 			modules: [
	// 				'src/a',
	// 				'src/b',
	// 				'src/c',
	// 			],
	// 		};
	// 		assert.deepEqual(actual, expected);
	// 	});
	// });

	it('should load adaptor nodejs modules', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let projectBase = path.join(base, 'adaptors/proj');
			let actual = await expandOptions({
				base: projectBase,
				cssTranspilerAdaptor: 'assert',
				cssMinifierAdaptor: './cssmin.js',
				jsMinifierAdaptor: '../jsmin.js',
			});
			assert.equal(actual.cssTranspilerAdaptor, assert);
			assert.deepEqual(actual.cssMinifierAdaptor, { foo: 'cssmin' });
			assert.deepEqual(actual.jsMinifierAdaptor, { bar: 'jsmin' });
		});
	});

});


