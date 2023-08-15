/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const buildTranspilerFile = require('../src/buildTranspilerFile.js');

describe(name, async () => {

	it('should send paths to adapter function and return asset paths', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({
				collations: [ { name: 'site', modules: ['src/*'] } ],
				cssTranspilerAdapter: './fakeTranspiler.js',
				isDev: true,
			});

			let originalAssetList = await buildTranspilerFile(settings);

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(originalAssetList, [
				'src/c/icon.gif',
			]);

			assert.deepEqual(created, [
				'dev/site.css',
				'dev/temp/assets/src/a/a.css',
				'dev/temp/assets/src/b/b.scss',
				'dev/temp/assets/src/c/c.scss',
				'dev/temp/site.css.scss',
			]);
		
			assert.equal(after['dev/temp/assets/src/a/a.css'], '#a-css{}');
			assert.equal(after['dev/temp/assets/src/b/b.scss'], '#b-sass{}');
			assert.equal(after['dev/temp/assets/src/c/c.scss'],
				// relative to {base}/dev, since that's where output.css will be.
				'#c-sass{ background: url(assets/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }'
			);
		
			assert.deepEqual(JSON.parse(after['dev/temp/site.css.scss']), {
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
				collations: [ { name: 'site', modules: ['src/*'] } ],
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

			assert.equal(after['dev-weird/temp/zote/sbor/src/c/c.scss'],
				// relative to {base}/dev-weird/foo, since that's where output.css will be.
				'#c-sass{ background: url(../zote/sbor/src/c/icon.gif?h=gJI5Yp!Ng9C6F7mGWXybWDBcL38~) }'
			);
		
			assert.deepEqual(JSON.parse(after['dev-weird/temp/foo/output.css.scss']), {
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

});
