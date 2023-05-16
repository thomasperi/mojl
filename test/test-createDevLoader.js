/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const createDevLoader = require('../src/createDevLoader.js');

describe(name, async () => {

	it('should create a template function that accepts an object and uses its properties', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let templateFile = path.join(base, 'test-template.txt');
			let template = await createDevLoader(templateFile);
			let actual = template({
				foo: 1,
				bar: 2,
				zote: 3,
			});
			let expected = '1,2,3';
			assert.equal(actual, expected);
		});
	});

});


