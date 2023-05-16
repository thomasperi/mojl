/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const getModuleFilesOfType = require('../src/getModuleFilesOfType.js');
const expandModulePaths = require('../src/expandModulePaths.js');

describe(name, async () => {
	it('should find .css files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let modules = await expandModulePaths(base, ['src/*']);
			let actual = await getModuleFilesOfType(base, modules, ['css']);
			let expected = [
				'src/a/a.css',
				'src/b/b.css',
				'src/c/c.css',
				'src/d/d.css',
				'src/e/e.css',
				'src/f/f.css',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should find .js files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let modules = await expandModulePaths(base, ['src/*']);
			let actual = await getModuleFilesOfType(base, modules, ['js']);
			let expected = [
				'src/d/d.js',
				'src/e/e.js',
				'src/f/f.js',
				'src/g/g.js',
				'src/h/h.js',
				'src/i/i.js',
			];
			assert.deepEqual(actual, expected);
		});
	});

	it('should find .scss files and fall back to .css files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let modules = await expandModulePaths(base, ['src/*']);
			let actual = await getModuleFilesOfType(base, modules, ['scss', 'css']);
			let expected = [
				'src/a/a.css',
				'src/b/b.css',
				'src/c/c.css',
				'src/d/d.scss',
				'src/e/e.scss',
				'src/f/f.scss',
				'src/j/j.scss',
				'src/k/k.scss',
				'src/l/l.scss',
			];
			assert.deepEqual(actual, expected);
		});
	});

});
