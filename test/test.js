/**
 * These tests work by comparing the results from simulating a build
 * with results from a prior build.
 * 
 * To create a new test (or update an existing one) passing `true` as the
 * second argument to `test` will cause the "expected" reference files to be
 * rewritten. Examine the resulting build files to determine whether the build
 * went as expected, then remove the `true` from the `test` call.
 */

/*global require, describe, it, __dirname, setTimeout, console */

const mojl = require('../mojl.js');

const fs = require('fs');
const path = require('path');

const chai = require('chai');
// const assert = chai.assert;
const expect = chai.expect;
// const should = chai.should();

// For fs.readFileSync
const utf8 = {encoding: 'utf8'};


// Be conspicuous
function warn(name) {
	console.log(`
    + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
    |                                                                 |
        WARNING
        "${name}" is in write mode!
    |                                                                 |
    + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
    `);
}

function test(name, write) {

	function relativize(plan) {
		Object.keys(plan).forEach(abspath => {
			let content = plan[abspath],
				relpath = abspath.substr(base.length);
			delete plan[abspath];
			plan[relpath] = content;
		});
		return plan;
	}

	let base = path.join(__dirname, name),
		expected_path = path.join(base, 'expected.json'),
		config_path = path.join(base, 'config.json'),
		config = { base };
	
	if (fs.existsSync(config_path)) {
		Object.assign(
			config, 
			JSON.parse(fs.readFileSync(config_path, utf8))
		);
	}
	
	if (write) {
		mojl.debug = true;
		fs.writeFileSync(
			expected_path,
			JSON.stringify(
				relativize(
					mojl.build(config)
				),
				null, 2
			)
		);
		mojl.debug = false;
		setTimeout(()=>warn(name), 500);
	}

	let actual = relativize(
			mojl.simulate_build(config)
		),
		expected = JSON.parse(
			fs.readFileSync(expected_path, utf8)
		);
	
	it(name, () => {
		expect(actual).to.eql(expected);
	});
}


describe('Directory Comparison Tests', () => {

	test('single-module');
	test('multiple-modules');
	test('ordered-head');
	test('ordered-tail');
	test('ordered-both');
	test('custom-directories');
	test('custom-directories-nested');
	test('rewrite-image-paths');
	test('multiple-asset-dirs');
	test('custom-file-types');
	test('sub-extensions');

	test('multiple-srcs');
	test('multiple-srcs-ordered');
	test('multiple-srcs-multiple-dests');
	test('multiple-srcs-multiple-dests-nested');

	test('nested-modules');
	
	
	// to-do: more multi-module-dir tests	
	

// 	test('rewrite-image-paths-nested', true);

});
