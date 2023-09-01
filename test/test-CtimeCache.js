/*global describe, it */
const fs = require('fs');
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const CtimeCache = require('../src/CtimeCache.js');
const expandOptions = require('../src/expandOptions.js');

const has = Object.prototype.hasOwnProperty;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(name, async () => {

	it('should be fresh after being freshened', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			const relFile = 'src/foo/file.txt';
	
			const fresh1 = await cache.hasFreshEntry(relFile);
			assert(!fresh1);

			await cache.freshenEntry(relFile);
	
			const fresh2 = await cache.hasFreshEntry(relFile);
			assert(fresh2);
		});
	});
	
	it('should not add cache files without cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
			
			await cache.freshenEntry(relFile);
			
			const entry = await cache.getEntry(relFile);
			
			assert(has.call(entry, 'hash'));
			assert(has.call(entry, 'ctimeMs'));
	
			assert(!!entry.hash);
			assert(!!entry.ctimeMs);
			
			const after = box.snapshot();
			assert(!has.call(after, 'mojl_cache/hashes/src/foo/file.txt.mojlcache'));
		});
	});
	
	it('should add cache files with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
			
			await cache.freshenEntry(relFile);
			
			const entry = await cache.getEntry(relFile);
			
			assert(has.call(entry, 'hash'));
			assert(has.call(entry, 'ctimeMs'));
	
			assert(!!entry.hash);
			assert(!!entry.ctimeMs);
			
			const after = box.snapshot();
			assert.equal(
				after['mojl_cache/hashes/src/foo/file.txt.mojlcache'],
				`${entry.hash} ${entry.ctimeMs}`
			);
		});
	});
	
	it('should use custom cacheDir name', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheDir: 'zote_cache', cacheSave: true });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			await cache.freshenEntry(relFile);
			
			const entry = await cache.getEntry(relFile);
			
			const after = box.snapshot();
			assert.equal(
				after['zote_cache/hashes/src/foo/file.txt.mojlcache'],
				`${entry.hash} ${entry.ctimeMs}`
			);
		});
	});
	
	it('should change after file is added', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
		});
	});
	
	it('should change after file is added with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
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
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
		});
	});
	
	it('should change when file is modified with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			const absFile = path.join(base, relFile);
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			fs.writeFileSync(absFile, 'foo', 'utf8');
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
		});
	});
	
	it('should NOT change when file is NOT modified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(fresh);
		});
	});
	
	it('should NOT change when file is NOT modified, with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true });
			const cache = new CtimeCache(settings);
			
			const relFile = 'src/foo/file.txt';
			
			await cache.freshenEntry(relFile);
			await sleep(50);
			
			const fresh = await cache.hasFreshEntry(relFile);
			assert(fresh);
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
	
			const fresh = await cache.hasFreshEntry(relFile);
			assert(!fresh);
		});
	});
	
	// // to-do
	// // it('should remove a record when its ttl is exceeded and a different file is changed', async () => {
	// // 	await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
	// // 		let file1 = path.join(base, 'ctime-test.txt');
	// // 		let file2 = path.join(base, 'ctime-test-2.txt');
	// // 		
	// // 		ctimeCache.ttl = 1;
	// // 
	// // 		ctimeCache.freshen(file1);
	// // 		ctimeCache.freshen(file2);
	// // 
	// // 		await sleep(50);
	// // 
	// // 		ctimeCache.freshen(file2);
	// // 		
	// // 		try {
	// // 			assert(!has.call(ctimeCache.cache, file1));
	// // 			assert(has.call(ctimeCache.cache, file2));
	// // 		} finally {
	// // 			ctimeCache.reset();
	// // 		}
	// // 
	// // 	});
	// // });
	
	it('should not create entries for nonexistent files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true });
			const cache = new CtimeCache(settings);
			const relFile = 'src/foo/file.txt';
			const rel404 = 'src/foo/404.txt'; // not there
	
			await cache.freshenEntry(relFile);
			await cache.freshenEntry(rel404);
			
			const entry = await cache.getEntry(rel404);
			assert(!entry);
			
			const after = box.snapshot();
			
			assert(has.call(after, 'mojl_cache/hashes/src/foo/file.txt.mojlcache'));
			assert(!has.call(after, 'mojl_cache/hashes/src/foo/404.txt.mojlcache'));
		});
	});
	
	it('should read existing cache entries without cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base });
			const relFile = 'src/foo/file.txt';
	
			// Create cache entry
			const cache_1 = new CtimeCache({...settings, cacheSave: true}); // write the files...
			const fresh_1a = await cache_1.hasFreshEntry(relFile);
			assert(!fresh_1a);
	
			await cache_1.freshenEntry(relFile);
			const fresh_1b = await cache_1.hasFreshEntry(relFile);
			assert(fresh_1b);
			
			// Read cache entry
			const cache_2 = new CtimeCache(settings); // ...but don't read the files.
			const fresh_2 = await cache_2.hasFreshEntry(relFile);
			assert(!fresh_2);
		});
	});
	
	it('should read existing cache entries with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ base, cacheSave: true }); // write and read them.
			const relFile = 'src/foo/file.txt';
	
			// Create cache entry
			const cache_1 = new CtimeCache(settings);
			const fresh_1a = await cache_1.hasFreshEntry(relFile);
			assert(!fresh_1a);
	
			await cache_1.freshenEntry(relFile);
			const fresh_1b = await cache_1.hasFreshEntry(relFile);
			assert(fresh_1b);
			
			// Read cache entry
			const cache_2 = new CtimeCache(settings);
			const fresh_2 = await cache_2.hasFreshEntry(relFile);
			assert(fresh_2);
		});
	});

});

