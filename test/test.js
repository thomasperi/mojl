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
// mojl.suppress_warnings = true;

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
	
	// Convert all timestamps to a consistent string so that the tests
	// don't rely on the actual timestamps of the files.
	Object.keys(actual).map(key => {
		actual[key] = actual[key].replace(
			/\?t=\d+/g,
			'?t=TIMESTAMP_REMOVED_FOR_TESTING'
		);
	});
	Object.keys(expected).map(key => {
		expected[key] = expected[key].replace(
			/\?t=\d+/g,
			'?t=TIMESTAMP_REMOVED_FOR_TESTING'
		);
	});
	
	// Compare results
	
	// An array of filenames in common between expected and actual results.
	let common_files = [];
	
	// Each file in actual should also be in expected.
	Object.keys(actual).forEach(filename => {
		// If the filename isn't expected, issue a test known to fail.
		if (!expected.hasOwnProperty(filename)) {
			it(name + ': ' + filename + ' should not exist', () => {
				expect(false);
			});
		}
	});

	// Each file in expected should also be in actual.
	Object.keys(expected).forEach(filename => {
		let actual_has_file = actual.hasOwnProperty(filename);
		it(name + ': ' + filename + ' should exist', () => {
			expect(actual_has_file);
		});

		// Stash the fact that this file is in both expected and actual,
		// for the next set of tests.
		if (actual_has_file) {
			common_files.push(filename); 
		}
	});
	
	// The files they have in common should have the same contents.
	common_files.forEach(filename => {
		it(name + ': ' + filename + ' contents should match expected', () => {
			expect(actual[filename]).to.eql(expected[filename]);
		});
	});
}


describe('Directory Comparison Tests', () => {
	// 1.0

	// Tests for 1.0 functionality
	test('single-module');
	test('multiple-modules');
	test('rewrite-image-paths');
	test('multiple-asset-dirs');
	test('custom-file-types');
	test('sub-extensions');
	
	// Some more 1.0 tests that are duplicated below with the 1.1 way.
	test('custom-directories');
	test('custom-directories-nested');
	test('ordered-head');
	test('ordered-tail');
	test('ordered-both');
	
	// 1.1

	// Those 1.0 tests modified for 1.1
	test('custom-directories-mappings');
	test('custom-directories-nested-mappings');
	test('ordered-head-mappings');
	test('ordered-tail-mappings');
	test('ordered-both-mappings');
	
	// Same test but with mappings assigned to a single object
	// instead of an array, to test the auto-wrapping inside an array.
	test('ordered-both-mappings-imply-array');

	// Tests for 1.1 mappings
	test('multiple-mappings');
	test('multiple-module-dirs');
	test('multiple-mix-match');

	// Tests for 1.1 "require" feature
	test('require-module');
	test('require-module-imply-array'); // See other "-imply-array" tests
	test('require-wildcard');
	test('require-from-wildcard');
	test('require-nested');
	test('require-recursive-stop');
	test('require-recursive-stop-reversed');

	// Tests for 1.1 config.external
	test('external');
	test('external-require');
	test('external-require-imply-array'); // See other "-imply-array" tests
	
	
});
