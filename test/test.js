/**
 * These tests work by comparing the expected results from simulating a build
 * with actual results in files that were produced with the same config.
 */

/*global require, describe, it, __dirname */
const mojl = require('../mojl.js');

const fs = require('fs');
const path = require('path');

const chai = require('chai');
// const assert = chai.assert;
const expect = chai.expect;
// const should = chai.should();


function test(name, config, write) {
	let base = path.join(__dirname, name),
		expected_path = path.join(base, 'expected.json');

	config = { base, ...config };

	function relativize(plan) {
		Object.keys(plan).forEach(abspath => {
			let content = plan[abspath],
				relpath = abspath.substr(base.length);
			delete plan[abspath];
			plan[relpath] = content;
		});
		return plan;
	}

	if (write) {
		fs.writeFileSync(
			expected_path,
			JSON.stringify(
				relativize(
					mojl.build(config)
				),
				null, 2
			)
		);
	}

	let actual = relativize(
			mojl.simulate_build(config)
		),
		expected = JSON.parse(
			fs.readFileSync(expected_path, {encoding: 'utf8'})
		);
	
	it(name, () => {
		expect(actual).to.eql(expected);
	});
}


describe('Directory Comparison Tests', () => {

	test('single-module', {});
	test('multiple-modules', {});

});
