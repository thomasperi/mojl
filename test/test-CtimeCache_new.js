/*global describe, it */
const fs = require('fs');
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const CtimeCache = require('../src/CtimeCache_new.js');
const expandOptions = require('../src/expandOptions.js');

const has = Object.prototype.hasOwnProperty;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(name, async () => {
	
	it('should do some basic things', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const stale = await cache.entryIsStale(relFile);
			assert(stale);
			
			await cache.freshenEntry(relFile);
			
			const entry = await cache.getEntry(relFile);
			assert(has.call(entry, 'hash'));
			assert(has.call(entry, 'ctimeMs'));
			assert(has.call(entry, 'expires'));
			
			const after = box.snapshot();
			assert.equal(
				after['mojl_cache/hashes/src/foo/file.txt.mojlcache'],
				`${entry.hash} ${entry.ctimeMs} ${entry.expires}`
			);
		});
	});

	it('should change after file is added', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const stale = await cache.entryIsStale(relFile);
			assert(stale);
		});
	});
	
	it('should change when file is modified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			const absFile = path.join(base, relFile);
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			fs.writeFileSync(absFile, 'foo', 'utf8');
			
			const changed = await cache.entryIsStale(relFile);
			assert(changed);
		});
	});

	it('should NOT change when file is NOT modified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			
			const changed = await cache.entryIsStale(relFile);
			assert(!changed);
		});
	});
	
	it('should change when modification date is changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			const absFile = path.join(base, relFile);
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			
			const oneSecondAgo = new Date(Date.now() - 1000);
			fs.utimesSync(absFile, oneSecondAgo, oneSecondAgo);

			const changed = await cache.entryIsStale(relFile);
			assert(changed);
		});
	});
	
	it('should change when ttl is exceeded', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheTTL: 1 });
			const cache = new CtimeCache(settings);
			const relFile = 'src/foo/file.txt';
	
			await cache.freshenEntry(relFile);

			await sleep(50);
	
			const changed = await cache.entryIsStale(relFile);
			assert(changed);
		});
	});
	
	// to-do
	// it('should remove a record when its ttl is exceeded and a different file is changed', async () => {
	// 	await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
	// 		let file1 = path.join(base, 'ctime-test.txt');
	// 		let file2 = path.join(base, 'ctime-test-2.txt');
	// 		
	// 		ctimeCache.ttl = 1;
	// 
	// 		ctimeCache.freshen(file1);
	// 		ctimeCache.freshen(file2);
	// 
	// 		await sleep(50);
	// 
	// 		ctimeCache.freshen(file2);
	// 		
	// 		try {
	// 			assert(!has.call(ctimeCache.cache, file1));
	// 			assert(has.call(ctimeCache.cache, file2));
	// 		} finally {
	// 			ctimeCache.reset();
	// 		}
	// 
	// 	});
	// });
	
	it('should not change when nothing has changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			const relFile = 'src/foo/file.txt';
	
			await cache.freshenEntry(relFile);

			await sleep(50);
	
			const stale = await cache.entryIsStale(relFile);
			assert(!stale);
		});
	});

});

