/*global describe, it */
const assert = require('assert');
const fs = require('fs');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const mirrorAssets = require('../src/mirrorAssets.js');

describe(name, async () => {

	it('should symlink to source modules when building for dev and symlinkDevAssets is true', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let settings = await expandOptions({isDev: true});

			await mirrorAssets(settings);
			
			let after = box.snapshot();
			let diff = box.diff(before, after);
			
			// Should have symlinked each module
			assert(fs.lstatSync(path.join(base, 'dev/assets/src/a')).isSymbolicLink());
			assert.equal(
				fs.realpathSync(path.join(base, 'dev/assets/src/a')),
				path.join(base, 'src/a')
			);
	
			assert(fs.lstatSync(path.join(base, 'dev/assets/src/b')).isSymbolicLink());
			assert.equal(
				fs.realpathSync(path.join(base, 'dev/assets/src/b')),
				path.join(base, 'src/b')
			);
	
			assert(fs.lstatSync(path.join(base, 'dev/assets/src/c')).isSymbolicLink());
			assert.equal(
				fs.realpathSync(path.join(base, 'dev/assets/src/c')),
				path.join(base, 'src/c')
			);

			assert.deepEqual(diff.created, [
				'dev/assets/src/a/a.css',
				'dev/assets/src/a/a.js',
				'dev/assets/src/a/foo.gif',
				'dev/assets/src/a/z.tpl.js',
				'dev/assets/src/b/b.css',
				'dev/assets/src/b/b.js',
				'dev/assets/src/b/b.php',
				'dev/assets/src/c/bar.gif',
				'dev/assets/src/c/c.js',
				'dev/assets/src/c/c.zazz',
			]);

		});
		
	});
	
	it('should copy source assets except .tpl.js when building for dev and symlinkDevAssets is false', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				symlinkDevAssets: false,
				isDev: true,
			});

			const before = box.snapshot();
			
			await mirrorAssets(settings);
			
			const after = box.snapshot();
			const diff = box.diff(before, after);
			
			// NOT symlinks
			assert(!fs.lstatSync(path.join(base, 'dev/assets/src/a')).isSymbolicLink());
			assert(!fs.lstatSync(path.join(base, 'dev/assets/src/b')).isSymbolicLink());
			assert(!fs.lstatSync(path.join(base, 'dev/assets/src/c')).isSymbolicLink());

			assert.deepEqual(diff.created, [
				'dev/assets/src/a/a.css',
				'dev/assets/src/a/a.js',
				'dev/assets/src/a/foo.gif',
				'dev/assets/src/b/b.css',
				'dev/assets/src/b/b.js',
				'dev/assets/src/b/b.php',
				'dev/assets/src/c/bar.gif',
				'dev/assets/src/c/c.js',
				'dev/assets/src/c/c.zazz',
			]);
		});
	});
	
	it('should exclude css and js when building for dist', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();

			const before = box.snapshot();
			
			await mirrorAssets(settings);
			
			const after = box.snapshot();
			const diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/assets/src/a/foo.gif',
				'dist/assets/src/b/b.php',
				'dist/assets/src/c/bar.gif',
				'dist/assets/src/c/c.zazz',
			]);
		});
	});

	it('should honor the excludeFileTypesFromMirror option', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				excludeFileTypesFromMirror: ['php']
			});

			const before = box.snapshot();
			
			await mirrorAssets(settings);
			
			const after = box.snapshot();
			const diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/assets/src/a/foo.gif',
				'dist/assets/src/c/bar.gif',
				'dist/assets/src/c/c.zazz',
			]);
		});
	});
	
	it('should exclude transpiler files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				cssTranspilerAdaptor: './fakeTranspiler.js',
			});

			const before = box.snapshot();
			
			await mirrorAssets(settings);
			
			const after = box.snapshot();
			const diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/assets/src/a/foo.gif',
				'dist/assets/src/b/b.php',
				'dist/assets/src/c/bar.gif',
			]);
		});
	});

	it('should work with combinations', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({
				excludeFileTypesFromMirror: ['php'],
				cssTranspilerAdaptor: './fakeTranspiler.js',
			});

			const before = box.snapshot();
			
			await mirrorAssets(settings);
			
			const after = box.snapshot();
			const diff = box.diff(before, after);
			
			assert.deepEqual(diff.created, [
				'dist/assets/src/a/foo.gif',
				'dist/assets/src/c/bar.gif',
			]);
		});
	});

});
