/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const deleteBuild = require('../src/deleteBuild.js');

describe(name, async () => {

	it('should delete the dev build folder', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions({isDev: true});

			await deleteBuild(settings);

			assert(!fs.existsSync(path.join(base, 'dev')));

			assert(fs.existsSync(path.join(base, 'dist')));
			assert(fs.existsSync(path.join(base, 'src')));
		});
	});

	it('should delete the dist build folder', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let settings = await expandOptions();

			await deleteBuild(settings);

			assert(!fs.existsSync(path.join(base, 'dist')));

			assert(fs.existsSync(path.join(base, 'dev')));
			assert(fs.existsSync(path.join(base, 'src')));
		});
	});

});

