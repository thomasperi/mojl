/*global describe, it */
const assert = require('assert');
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const expandOptions = require('../src/expandOptions.js');
const exportOptions = require('../src/exportOptions.js');

const has = Object.prototype.hasOwnProperty;

describe(name, async () => {
	it('should export', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const options = await expandOptions();
			const exported = exportOptions(options);
			const parsed = JSON.parse(exported);

			// console.log(JSON.stringify(parsed, null, 2));
			
			assert(!has.call(parsed, 'base'));
			assert(!has.call(parsed, '_cache'));
			assert(has.call(parsed, '_mojlVersion'));
			
			delete options.base;
			delete options._cache;
			delete parsed._mojlVersion;
			
			assert.deepEqual(options, parsed);
		});
	});
});


