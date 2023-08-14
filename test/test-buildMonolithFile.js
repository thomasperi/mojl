/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildMonolithFile = require('../src/buildMonolithFile.js');


const expectedCss = `
/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */
#a{}
#b{}
#c{ background: url(assets/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }
`;

const expectedWeirdCss = `
/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */
#a{}
#b{}
#c{ background: url(../assets/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }
`;

const expectedJs = `
/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */
let a;
let b;
let c;
`;

const expectedCssCaps = `
/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */
#A{}
#B{}
#C{ BACKGROUND: URL(ASSETS/SRC/C/ICON.GIF?H=GJI5YP!NG9C6F7MGWXYBWDBCL38~) }
`;

const expectedJsCaps = `
/* AUTO-GENERATED FILE. EDIT SOURCE FILES INSTEAD. */
LET A;
LET B;
LET C;
`;


// a function that returns what it was given, for testing without a minifier
// const identity = a => a;

// a fake minifier to test that the minifier function has been run
// const capitalize = a => a.toUpperCase();

describe(name, async () => {

	it('should concatenate CSS files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				cssMinifierAdapter: '',
			});
			let type = 'css';
			let originalAssetList = await buildMonolithFile(settings, type);
			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.css",
			]);
			assert.equal(after["dist/site.css"].trim(), expectedCss.trim());
		});
	});

	it('should concatenate CSS files and minify by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions();
			let type = 'css';
			let originalAssetList = await buildMonolithFile(settings, type);
			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.css",
			]);
			assert.equal(
				after["dist/site.css"].trim(),
				'#c{background:url(assets/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~)}'
			);
		});
	});

	it('should concatenate CSS files and run the fake minifier', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				cssMinifierAdapter: './capitalize.js',
			});
			let type = 'css';
			let originalAssetList = await buildMonolithFile(settings, type);
			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.css",
			]);
			assert.equal(after["dist/site.css"].trim(), expectedCssCaps.trim());
		});
	});

	it('should replace URLs in CSS files with weird paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				cssMinifierAdapter: '',
				buildDistDir: 'dist-weird',
				collations: {
					'stuff/styles-weird': ['src/**'],
				},
			});
			let type = 'css';
			await buildMonolithFile(settings, type);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist-weird/stuff/styles-weird.css",
			]);
			assert.equal(after["dist-weird/stuff/styles-weird.css"].trim(), expectedWeirdCss.trim());
		});
	});

	it('should concatenate JS files and minify by default', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions();
			let type = 'js';
			await buildMonolithFile(settings, type);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.js",
			]);
			assert.equal(after["dist/site.js"].trim(), 'let a,b,c;');
		});
	});

	it('should concatenate JS files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				jsMinifierAdapter: '',
			});
			let type = 'js';
			await buildMonolithFile(settings, type);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.js",
			]);
			assert.equal(after["dist/site.js"].trim(), expectedJs.trim());
		});
	});

	it('should concatenate JS files and run the fake minifier', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				jsMinifierAdapter: './capitalize.js',
			});
			let type = 'js';
			await buildMonolithFile(settings, type);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.js",
			]);
			assert.equal(after["dist/site.js"].trim(), expectedJsCaps.trim());
		});
	});

	it('should concatenate JS and CSS files from the same expanded modules', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				cssMinifierAdapter: '',
				jsMinifierAdapter: '',
			});
			await buildMonolithFile(settings, 'css');
			await buildMonolithFile(settings, 'js');

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				"dist/site.css",
				"dist/site.js",
			]);
			assert.equal(after["dist/site.js"].trim(), expectedJs.trim());
			assert.equal(after["dist/site.css"].trim(), expectedCss.trim());
		});
	});

});
