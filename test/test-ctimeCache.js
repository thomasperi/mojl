/*global describe, it */
const fs = require('fs');
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const ctimeCache = require('../src/ctimeCache.js');

const has = Object.prototype.hasOwnProperty;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(name, async () => {
	
	it('should add and reset', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');

			ctimeCache.freshen(file);
			assert(has.call(ctimeCache.cache, file));

			ctimeCache.ttl = 10;
			ctimeCache.reset();
			
			assert(ctimeCache.ttl === 86400000);
			assert(!has.call(ctimeCache.cache, file));
		});
	});

	it('should change after file is added', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');
			
			let changed = ctimeCache.freshen(file);
			try {
				assert(changed);
			} finally {
				ctimeCache.reset();
			}
		});
	});

	it('should change when file is modified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');
			
			ctimeCache.freshen(file);
			
			await sleep(50);

			fs.writeFileSync(file, 'foo', 'utf8');
			let changed = ctimeCache.freshen(file);
			try {
				assert(changed);
			} finally {
				ctimeCache.reset();
			}
		});
	});

	it('should change when modification date is changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');
			
			ctimeCache.freshen(file);

			await sleep(50);

			let oneSecondAgo = new Date(Date.now() - 1000);
			fs.utimesSync(file, oneSecondAgo, oneSecondAgo);
			let changed = ctimeCache.freshen(file);
			try {
				assert(changed);
			} finally {
				ctimeCache.reset();
			}
		});
	});

	it('should change when ttl is exceeded', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');
			
			ctimeCache.ttl = 1;

			ctimeCache.freshen(file);

			await sleep(50);

			let changed = ctimeCache.freshen(file);
			
			try {
				assert(changed);
			} finally {
				ctimeCache.reset();
			}

		});
	});

	it('should remove a record when its ttl is exceeded and a different file is changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file1 = path.join(base, 'ctime-test.txt');
			let file2 = path.join(base, 'ctime-test-2.txt');
			
			ctimeCache.ttl = 1;

			ctimeCache.freshen(file1);
			ctimeCache.freshen(file2);

			await sleep(50);

			ctimeCache.freshen(file2);
			
			try {
				assert(!has.call(ctimeCache.cache, file1));
				assert(has.call(ctimeCache.cache, file2));
			} finally {
				ctimeCache.reset();
			}

		});
	});

	it('should not change when nothing has changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			let file = path.join(base, 'ctime-test.txt');
			
			ctimeCache.freshen(file);

			let changed = ctimeCache.freshen(file);
			try {
				assert(!changed);
			} finally {
				ctimeCache.reset();
			}
		});
	});

});

