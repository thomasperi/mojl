/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const hashStamp = require('../src/hashStamp.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(name, async () => {

	it('should create a unique hash stamp based on the contents of a file', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'test.txt');

			await sleep(10);

			fs.writeFileSync(file, 'foo', 'utf8');
			let actualFoo = await hashStamp(file);
			
			await sleep(10);
			
			fs.writeFileSync(file, 'bar', 'utf8');
			let actualBar = await hashStamp(file);

			await sleep(10);
			
			fs.writeFileSync(file, '', 'utf8');
			let actualEmpty = await hashStamp(file);

			assert.equal(actualFoo, '?h=C*7Hteo!D9vJXQ3UfzxbwnXaijM~');
			assert.equal(actualBar, '?h=Ys23Ag!5IOWqZCw9QGaVDdHwH00~');
			assert.equal(actualEmpty, '?h=2jmj7l5rSw0yVb!vlWAYkK!YBwk~');
		});
	});

	it('should create a not-found stamp for a file that does not exist', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let actual = await hashStamp(path.join(base, 'test.txt')); // doesn't exist
			assert.equal(actual, '?h=not-found');
		});
	});

});
