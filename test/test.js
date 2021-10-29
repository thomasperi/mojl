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
const assert = chai.assert;
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
	
// 	console.log('=== ' + name + ' ===');

	function relativize(plan) {
		Object.keys(plan).forEach(abspath => {
			let content = plan[abspath],
				relpath = abspath.substr(base.length);
			delete plan[abspath];
			if (
				typeof content === 'object' &&
				content.hasOwnProperty('source')
			) {
				content.source = content.source.substr(base.length);
			}
			plan[relpath] = content;
		});
		return plan;
	}

	let base = path.join(__dirname, name),
		expected_warnings_path = path.join(base, 'expected-warnings.json'),
		expected_path = path.join(base, 'expected.json'),
		config_path = path.join(base, 'config.json'),
		config = { base },
		actual,
		expected,
		actual_warnings,
		expected_warnings;

	config.warn = msg => {
		actual_warnings.push(msg.replace(/^.*\[(\w+)\].*$/g, "$1"));
	};
	
	if (fs.existsSync(config_path)) {
		Object.assign(
			config, 
			JSON.parse(fs.readFileSync(config_path, utf8))
		);
	}
	
	if (write) {
		mojl.debug = true;
		actual_warnings = [];
		fs.writeFileSync(
			expected_path,
			JSON.stringify(
				relativize(
					mojl.build(config)
				),
				null, 2
			)
		);
		fs.writeFileSync(
			expected_warnings_path,
			JSON.stringify(
				actual_warnings,
				null, 2
			)
		);
		mojl.debug = false;
		setTimeout(()=>warn(name), 500);
	}

	actual_warnings = [];
	actual = relativize(
		mojl.simulate_build(config)
	);

	expected_warnings = fs.existsSync(expected_warnings_path) ?
		JSON.parse(
			fs.readFileSync(expected_warnings_path, utf8)
		) : [];
	expected = JSON.parse(
		fs.readFileSync(expected_path, utf8)
	);
	
	// Convert all timestamps to a consistent string so that the tests
	// don't rely on the actual timestamps of the files.
	Object.keys(actual).map(key => {
		if (typeof actual[key] === 'string') {
			actual[key] = actual[key].replace(
				/\?t=\d+/g,
				'?t=TIMESTAMP_REMOVED_FOR_TESTING'
			);
		}
	});
	Object.keys(expected).map(key => {
		if (typeof expected[key] === 'string') {
			expected[key] = expected[key].replace(
				/\?t=\d+/g,
				'?t=TIMESTAMP_REMOVED_FOR_TESTING'
			);
		}
	});
	
	// Compare results
	
	// An array of filenames in common between expected and actual results.
	let common_files = [];
	
	// Each file in actual should also be in expected.
	Object.keys(actual).forEach(filename => {
		// If the filename isn't expected, issue a test known to fail.
		if (!expected.hasOwnProperty(filename)) {
			it(name + ': ' + filename + ' should not exist', () => {
				assert(false);
			});
		}
	});

	// Each file in expected should also be in actual.
	Object.keys(expected).forEach(filename => {
		let actual_has_file = actual.hasOwnProperty(filename);
		it(name + ': ' + filename + ' should exist', () => {
			assert(actual_has_file);
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
	
	// Compare actual warnings to expected warnings.
	it(name + ': expected warnings should match actual warnings', () => {
		expect(actual_warnings).to.eql(expected_warnings);
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
	test('ordered-head'); // (modified for 1.1 deprecation warning)
	test('ordered-tail'); // (modified for 1.1 deprecation warning)
	test('ordered-both'); // (modified for 1.1 deprecation warning)
	
	// 1.1

	// Those 1.0 tests modified for 1.1
	test('custom-directories-mappings');
	test('custom-directories-nested-mappings');
	test('ordered-head-mappings');
	test('ordered-tail-mappings');
	test('ordered-both-mappings');
	
	// 1.0 test modified to suppress the 1.1 deprecation warning
	test('ordered-head-no-warning');
	
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
	
	// Tests for 1.1 config.mirror_dir
	test('multiple-asset-dirs-mirror-true');
	test('multiple-asset-dirs-mirror-name');
	test('multiple-asset-dirs-mirror-dot');
	test('multiple-asset-dirs-mirror-nodots');
	test('multiple-asset-dirs-mirror-exclude');
	test('multiple-asset-dirs-mirror-exclude-imply-array');
	test('dont-mirror-unused-modules');

});
