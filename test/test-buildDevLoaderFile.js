/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildDevLoaderFile = require('../src/buildDevLoaderFile.js');


const expectedCSS = `
@import "assets/src/a/a.css";
@import "assets/src/b/b.css";
@import "assets/src/c/c.css";
`;

const expectedJS = `
[
	"assets/src/a/a.js",
	"assets/src/b/b.js",
	"assets/src/c/c.js"
]
`;

describe(name, async () => {

	it('should build css dev loader file', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({
				modules: ['src/*']
			});
			let actualAssets = await buildDevLoaderFile(settings, 'css');

			let after = box.snapshot();
			let {created} = box.diff(before, after);
			
			assert.deepEqual(actualAssets, [
				'src/a/a.css',
				'src/b/b.css',
				'src/c/c.css',
				'src/c/icon.gif',
			]);
			
			assert.deepEqual(created, [
				"dev/styles.css",
			]);
			assert(after["dev/styles.css"].includes(expectedCSS.trim()));

		});
	});

	it('should build js dev loader file', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();
			
			let settings = await expandOptions({
				modules: ['src/*']
			});
			let actualAssets = await buildDevLoaderFile(settings, 'js');

			let after = box.snapshot();
			let {created} = box.diff(before, after);
			
			assert.deepEqual(actualAssets, [
				'src/a/a.js',
				'src/b/b.js',
				'src/c/c.js',
			]);

			assert.deepEqual(created, [
				"dev/scripts.js",
			]);
			assert(after["dev/scripts.js"].includes(expectedJS.trim()));
		});
	});

	it('should build both dev loader files from the same expanded modules', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				modules: ['src/*']
			});
			let actualAssetsJs = await buildDevLoaderFile(settings, 'js');
			let actualAssetsCss = await buildDevLoaderFile(settings, 'css');

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(actualAssetsJs, [
				'src/a/a.js',
				'src/b/b.js',
				'src/c/c.js',
			]);
			assert.deepEqual(actualAssetsCss, [
				'src/a/a.css',
				'src/b/b.css',
				'src/c/c.css',
				'src/c/icon.gif',
			]);

			assert.deepEqual(created, [
				"dev/scripts.js",
				"dev/styles.css",
			]);
			assert(after["dev/scripts.js"].includes(expectedJS.trim()));
			assert(after["dev/styles.css"].includes(expectedCSS.trim()));
		});
	});

});
