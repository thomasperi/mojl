/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandModulePaths = require('../src/expandModulePaths.js');

describe(name, async () => {

	it('should expand single-star module paths in alphabetical order but not recursively', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, ['src/*']);
			let expected = [
				'src/a',
				'src/b',
				'src/c',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should expand single stars as partial path nodes', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, ['src-2/ab*']);
			let expected = [
				'src-2/ab',
				'src-2/abc',
				'src-2/abe',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should expand double-star module paths recursively in alphabetical order', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, ['src/**']);
			let expected = [
				'src',
				'src/a',
				'src/b',
				'src/c',
				'src/c/d',
				'src/c/d/e',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should not match recursively without a double-star wildcard', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, ['src/c/d']);
			let expected = [
				'src/c/d',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should work with or without a slash at the end', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, [
				'src/c/d',
				'src/b',
			]);
			let expected = [
				'src/c/d',
				'src/b',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should keep explicit paths where they are', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, [
				'src/c',
				'src/**',
				'src/a',
			]);
			let expected = [
				'src/c',
				'src',
				'src/b',
				'src/c/d',
				'src/c/d/e',
				'src/a',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should keep only the first of any duplicates', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, [
				'src/c',
				'src/a',
				'src/**',
				'src/a',
				'src/c/d',
				'src/**',
			]);
			let expected = [
				'src/c',
				'src/a',
				'src',
				'src/b',
				'src/c/d/e',
				'src/c/d',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should remove entries starting with an exclamation point', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, [
				'src/**',
				'!src/c/d',
			]);
			let expected = [
				'src',
				'src/a',
				'src/b',
				'src/c',
				'src/c/d/e',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should add entries back in after removal via exclamation point', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await expandModulePaths(base, [
				'src/**',
				'!src/c/**',
				'src/c/d',
			]);
			let expected = [
				'src',
				'src/a',
				'src/b',
				'src/c/d',
			];
			assert.deepEqual(actual, expected);
		});
	});

});
