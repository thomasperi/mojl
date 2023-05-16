/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const templateTagFn = require('../src/templateTagFn.js');

function DelayedPromiser() {
	this.log = [];
	this.promise = (value, delay) => new Promise(resolve => {
		setTimeout(() => {
			this.log.push(value);
			resolve(value);
		}, delay);
	});
}

describe(name, async () => {

	it('should interleave strings and values', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let template = () => templateTagFn`
				foo
				${'bar'}
				zote
				${'sbor'}
				thed
			`;
			let actual = await template();
			let expected = `
				foo
				bar
				zote
				sbor
				thed
			`;
			assert.equal(actual, expected);
		});
	});

	it('should work in arbitrary order with promises', async () => {
		let promiser = new DelayedPromiser();
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let template = async () => templateTagFn`
				foo
				${promiser.promise('bar', 10)}
				zote
				${promiser.promise('sbor', 0)}
				thed
			`;
			let actual = await template();
			let expected = `
				foo
				bar
				zote
				sbor
				thed
			`;
			assert.equal(actual, expected);
			assert.deepEqual(promiser.log, [
				'sbor',
				'bar',
			]);
		});
	});

	it('should work sequentially with await', async () => {
		let promiser = new DelayedPromiser();
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let template = async () => templateTagFn`
				foo
				${await promiser.promise('bar', 10)}
				zote
				${await promiser.promise('sbor', 0)}
				thed
			`;
			let actual = await template();
			let expected = `
				foo
				bar
				zote
				sbor
				thed
			`;
			assert.equal(actual, expected);
			assert.deepEqual(promiser.log, [
				'bar',
				'sbor',
			]);
		});
	});

});
