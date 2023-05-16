/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const Mojl = require('../src/Mojl.js');

describe(name, async () => {

	it('should delete the dev build folder with constructor options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let mojl = new Mojl({isDev: true});
			await mojl.deleteBuild();
			assert(!fs.existsSync(path.join(base, 'dev')));
			assert(fs.existsSync(path.join(base, 'dist')));
			assert(fs.existsSync(path.join(base, 'src')));
		});
	});

	it('should delete the dev build folder with method options', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let mojl = new Mojl();
			await mojl.deleteBuild({isDev: true});
			assert(!fs.existsSync(path.join(base, 'dev')));
			assert(fs.existsSync(path.join(base, 'dist')));
			assert(fs.existsSync(path.join(base, 'src')));
		});
	});

	it('should delete the dist build folder', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let mojl = new Mojl();
			await mojl.deleteBuild();
			assert(fs.existsSync(path.join(base, 'dev')));
			assert(!fs.existsSync(path.join(base, 'dist')));
			assert(fs.existsSync(path.join(base, 'src')));
		});
	});

});

