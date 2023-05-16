/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const symlinkModules = require('../src/symlinkModules.js');
const expandModulePaths = require('../src/expandModulePaths.js');

describe(name, async () => {

	it('should symlink top-level modules', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let modules = await expandModulePaths(base, ['src/*']);

			// The paths to files through the eventual symlinked directories.
			let linkedA = path.join(base, 'dev/assets/src/a/a.css');
			let linkedB = path.join(base, 'dev/assets/src/a/b/b.css');
			let linkedC = path.join(base, 'dev/assets/src/c/c.css');

			// The known contents of the files.
			let expectedA = '.a{}';
			let expectedB = '.b{}';
			let expectedC = '.c{}';
			
			// The links that should to be created.
			// No link will be created for `b`, because it's is inside `a` which is linked.
			let expectedLinked = [
				'src/a',
				'src/c',
			];

			// The files pathed through their the symlinks should not exist yet.
			assert(!fs.existsSync(linkedA));
			assert(!fs.existsSync(linkedB));
			assert(!fs.existsSync(linkedC));

			// Create the symlinks and verify they've been created.
			let actualLinked = await symlinkModules(base, 'dev/assets', modules);
			assert.deepEqual(actualLinked, expectedLinked);

			// The files pathed through their the symlinks should exist now.
			assert(fs.existsSync(linkedA));
			assert(fs.existsSync(linkedB));
			assert(fs.existsSync(linkedC));

			// The files should have the same content when read through their symlinked paths.
			let actualA = fs.readFileSync(linkedA, 'utf8');
			let actualB = fs.readFileSync(linkedB, 'utf8');
			let actualC = fs.readFileSync(linkedC, 'utf8');
			
			assert.equal(actualA, expectedA);
			assert.equal(actualB, expectedB);
			assert.equal(actualC, expectedC);
		});
	});

});