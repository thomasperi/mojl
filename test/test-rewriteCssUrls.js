/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const rewriteCssUrls = require('../src/rewriteCssUrls.js');

describe(name, async () => {

	it('should replace all the urls', async () => {

		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars

			// double-escaped \\ are for the template literal
			const original = `
				.foo {
					/* A comment with 'single' and "double" quotes
						and multiple
						lines */
					/* Another comment with unmatch'd "quotes */
					/* A comment with a url(images/wrong.jpg) */
					// A line comment with a url(images/wrong.jpg)
					/* A block comment with terminating delimiter
						that looks like it's escaped but isn't \\*/
					--a: url("images\\"/a.jpg");
					--b: url('images\\'/b.jpg');
					--c: url(images/c.jpg);
					--a: url(
						"spaces\\"/a.jpg" );
					--b: url( 'spaces\\'/b.jpg'
						);
					--c: url(
							spaces/c.jpg
						);
					--d: "unmatched single ' inside double";
					--e: 'unmatched double " inside single';
					--f: "escaped unmatched double \\" inside double";
					--g: 'escaped unmatched single \\' inside single';
					--h: 'a string with a url(images/wrong.jpg)';
				}
			`;
			const expected = `
				.foo {
					/* A comment with 'single' and "double" quotes
						and multiple
						lines */
					/* Another comment with unmatch'd "quotes */
					/* A comment with a url(images/wrong.jpg) */
					// A line comment with a url(images/wrong.jpg)
					/* A block comment with terminating delimiter
						that looks like it's escaped but isn't \\*/
					--a: url("/test/images\\"/a.jpg");
					--b: url('/test/images\\'/b.jpg');
					--c: url(/test/images/c.jpg);
					--a: url("/test/spaces\\"/a.jpg");
					--b: url('/test/spaces\\'/b.jpg');
					--c: url(/test/spaces/c.jpg);
					--d: "unmatched single ' inside double";
					--e: 'unmatched double " inside single';
					--f: "escaped unmatched double \\" inside double";
					--g: 'escaped unmatched single \\' inside single';
					--h: 'a string with a url(images/wrong.jpg)';
				}
			`;
			let actual = await rewriteCssUrls(original, url => path.join('/test', url));
			// console.log(original);
			// console.log(expected);
			// console.log(actual);

			assert.equal(actual, expected);

		});

	});

});


