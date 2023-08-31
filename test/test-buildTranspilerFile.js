/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildTranspilerFile = require('../src/buildTranspilerFile.js');


function getTemp(after) {
	let temp;
	Object.keys(after).some(item => {
		let match = item.match(/\/(temp-\w+)\//);
		if (match) {
			temp = match[1];
			return true;
		}
		return false;
	});
	return temp;
}

describe(name, async () => {

	it('should send paths to adapter function and return asset paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				collations: [ { modules: ['src/*'] } ],
				cssTranspilerAdapter: './fakeTranspiler.js',
				isDev: true,
			});

			let originalAssetList = await buildTranspilerFile(settings);

			let after = box.snapshot();
			let temp = getTemp(after);
			let {created} = box.diff(before, after);

			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			assert.deepEqual(created, [
				`dev/site.css`,
				`dev/${temp}/assets/src/a/a.css`,
				`dev/${temp}/assets/src/b/b.scss`,
				`dev/${temp}/assets/src/c/c.scss`,
				`dev/${temp}/site.css.scss`,
				'mojl_cache/hashes/src/c/icon.gif.mojlcache',
			]);
		
			assert.equal(after[`dev/${temp}/assets/src/a/a.css`], '#a-css{}');
			assert.equal(after[`dev/${temp}/assets/src/b/b.scss`], '#b-sass{}');
			assert.equal(after[`dev/${temp}/assets/src/c/c.scss`],
				// relative to {base}/dev, since that's where output.css will be.
				'#c-sass{ background: url(assets/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }'
			);
		
			assert.deepEqual(JSON.parse(after[`dev/${temp}/site.css.scss`]), {
				isEntry: true,
				isDev: true,
				sourcePaths: [
					'assets/src/a/a.css',
					'assets/src/b/b.scss',
					'assets/src/c/c.scss',
				],
			});

			assert.deepEqual(JSON.parse(after['dev/site.css']), {
				isOutput: true,
			});
		});
	});

	it('should delete temp files when not building dev', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				collations: [ { modules: ['src/*'] } ],
				cssTranspilerAdapter: './fakeTranspiler.js',
			});

			let originalAssetList = await buildTranspilerFile(settings);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			assert.deepEqual(created, [
				'dist/site.css',
				'mojl_cache/hashes/src/c/icon.gif.mojlcache',
			]);
		
			assert.deepEqual(JSON.parse(after['dist/site.css']), {
				isOutput: true,
			});

		});
	});

	it('should replace URLs in CSS files with weird paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars

			let settings = await expandOptions({
				collations: [ { name: 'foo/output', modules: ['src/*'] } ],
				buildDevDir: 'dev-weird',
				buildAssetsDir: 'zote/sbor',
				cssTranspilerAdapter: './fakeTranspiler.js',
				isDev: true,
			});

			await buildTranspilerFile(settings);

			let after = box.snapshot();
			
			let temp = getTemp(after);

			assert.equal(after[`dev-weird/${temp}/zote/sbor/src/c/c.scss`],
				// relative to {base}/dev-weird/foo, since that's where output.css will be.
				'#c-sass{ background: url(../zote/sbor/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }'
			);
		
			assert.deepEqual(JSON.parse(after[`dev-weird/${temp}/foo/output.css.scss`]), {
				isEntry: true,
				isDev: true,
				sourcePaths: [
					'../zote/sbor/src/a/a.css',
					'../zote/sbor/src/b/b.scss',
					'../zote/sbor/src/c/c.scss'
				],
			});

			assert.deepEqual(JSON.parse(after['dev-weird/foo/output.css']), {
				isOutput: true,
			});
		});

	});

	it('should work with async run function', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars

			let settings = await expandOptions({
				collations: [ { name: 'foo/output', modules: ['src/*'] } ],
				buildDevDir: 'dev-weird',
				buildAssetsDir: 'zote/sbor',
				cssTranspilerAdapter: './fakeTranspilerAsync.js',
				isDev: true,
			});

			await buildTranspilerFile(settings);

			let after = box.snapshot();
			let temp = getTemp(after);

			assert.equal(after[`dev-weird/${temp}/zote/sbor/src/c/c.scss`],
				// relative to {base}/dev-weird/foo, since that's where output.css will be.
				'#c-sass{ background: url(../zote/sbor/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }'
			);
		
			assert.deepEqual(JSON.parse(after[`dev-weird/${temp}/foo/output.css.scss`]), {
				isEntry: true,
				isDev: true,
				sourcePaths: [
					'../zote/sbor/src/a/a.css',
					'../zote/sbor/src/b/b.scss',
					'../zote/sbor/src/c/c.scss'
				],
			});

			assert.deepEqual(JSON.parse(after['dev-weird/foo/output.css']), {
				isOutput: true,
			});
		});

	});

	it('should not collide temp deletions when a collation has no output', async () => {

		// NOTE:
		//
		// Before fixing the bug that this test case checks for, this test
		// would fail only when a hard-to-replicate race condition occurred.
		//
		// The bug was that all collations wrote to the same temp directory, and so
		// on a production build, they all tried to delete the same temp directory.
		// When one collation didn't have any output, an error would sometimes occur
		// when trying to remove the temp directory.
		//
		// Temp directories are created with mkdtemp now, which fixes that bug.
		// However, this test would only fail intermittently before the bug was fixed.
		
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars

			let settings = await expandOptions({
				collations: [
					{
						name: 'one',
						modules: [ 'src2/a' ],
					},
					{
						name: 'two',
						modules: [
							'src2/**',
							'!src2/a' 
						],
					}
				],
				cssTranspilerAdapter: './fakeTranspilerAsync.js',
			});

			let error = null;
			try {
				await buildTranspilerFile(settings);
			} catch (e) {
				error = e;
			}
			
			assert.equal(error, null);
		});
	});

});
