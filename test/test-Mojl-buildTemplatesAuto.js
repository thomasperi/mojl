/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const Mojl = require('../src/Mojl.js');

describe(name, async () => {

	it('should build all template files in the home directory recursively', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let before = box.snapshot();

			let mojl = new Mojl();
			await mojl.buildTemplatesAuto();

			let after = box.snapshot();
			let {created} = box.diff(before, after);

			assert.deepEqual(created, [
				'dist/bar/index.html',
				'dist/bar/thed/index.html',
				'dist/bar/thed/sneg/index.html',
				'dist/foo/index.html',
				'dist/foo/zote/index.html',
				'dist/foo/zote/sbor/index.html',
			]);
			assert.equal(after['dist/bar/index.html'], 'bar');
			assert.equal(after['dist/bar/thed/index.html'], 'thed');
			assert.equal(after['dist/bar/thed/sneg/index.html'], 'sneg');
			assert.equal(after['dist/foo/index.html'], 'foo');
			assert.equal(after['dist/foo/zote/index.html'], 'zote');
			assert.equal(after['dist/foo/zote/sbor/index.html'], 'sbor');
		});
	});

});

