/*global describe, it */
const fs = require('fs');
const assert = require('assert');
const path = require('path').posix;
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const HashCache = require('../src/HashCache.js');
const expandOptions = require('../src/expandOptions.js');

// const has = Object.prototype.hasOwnProperty;
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fooHash = 'C*7Hteo!D9vJXQ3UfzxbwnXaijM~';

describe(name, async () => {

	it('should not have any entries initially', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			
			const internalCache = await cache.getCache();
			assert.deepEqual(internalCache.entries, {});
		});
	});

	it('should have no existing entry for a file before the entry is created', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			let entry = await cache.readExistingEntry(relFile);
			assert.equal(entry, undefined);
		});
	});

	it('should have a fresh entry for a file after the entry is created', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			let entryCreated = await cache.createEntry(relFile);
			let entryRead = await cache.readExistingEntry(relFile);

			assert.equal(entryCreated, entryRead);

			assert.equal(entryRead.hash, fooHash);
			assert.equal(entryRead.relFile, relFile);

			assert(cache.entryIsFresh(entryRead));
		});
	});

	it('should not have a fresh entry for a file after the file is modified', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			await cache.createEntry(relFile);
			
			let entry;
			
			entry = await cache.readExistingEntry(relFile);
			assert(cache.entryIsFresh(entry));
			
			let absFile = path.join(base, relFile);
			fs.writeFileSync(absFile, 'foo', 'utf8');

			entry = await cache.readExistingEntry(relFile);
			assert(!cache.entryIsFresh(entry));
		});
	});

	it('should not have a fresh entry for a file after modification date is changed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			await cache.createEntry(relFile);
			
			let entry;
			
			entry = await cache.readExistingEntry(relFile);
			assert(cache.entryIsFresh(entry));
			
			let absFile = path.join(base, relFile);
			const oneSecondAgo = new Date(Date.now() - 1000);
			fs.utimesSync(absFile, oneSecondAgo, oneSecondAgo);

			entry = await cache.readExistingEntry(relFile);
			assert(!cache.entryIsFresh(entry));
		});
	});
	
	it('should create a new fresh entry if not already fresh', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			let createdEntry = await cache.createEntry(relFile);

			let absFile = path.join(base, relFile);
			fs.writeFileSync(absFile, 'foo', 'utf8');

			let existingEntry = await cache.readExistingEntry(relFile);
			assert.equal(createdEntry, existingEntry);
			
			let freshEntry = await cache.getFreshEntry(relFile);
			assert.notEqual(existingEntry, freshEntry);
		});
	});

	it('should get the same fresh entry if already fresh', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			const relFile = 'src/foo/foo.txt';
			
			let createdEntry = await cache.createEntry(relFile);
			let reCreatedEntry = await cache.createEntry(relFile);
			assert.notEqual(createdEntry, reCreatedEntry);

			let existingEntry = await cache.readExistingEntry(relFile);
			let freshEntry = await cache.getFreshEntry(relFile);
			assert.equal(reCreatedEntry, existingEntry);
			assert.equal(existingEntry, freshEntry);
		});
	});

	it('should not save mojl-cache.json without cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const cache = new HashCache(settings);
			
			const relFile = 'src/foo/foo.txt';
			
			await cache.getFreshEntry(relFile);
			const after = box.snapshot();
			
			assert.deepEqual(after, { 'src/foo/foo.txt': 'foo' });
		});
	});
	
	it('should save mojl-cache.json file with cacheSave', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ cacheSave: true });
			const cache = new HashCache(settings);
			
			const relFile = 'src/foo/foo.txt';
			
			await cache.getFreshEntry(relFile);
			await cache.saveCache();
			const after = box.snapshot();
			
			const fileList = Object.keys(after);
			assert.deepEqual(fileList, [
				'mojl-cache.json',
				'src/foo/foo.txt',
			]);
			
			const savedCache = JSON.parse(after['mojl-cache.json']);
			assert.deepEqual(Object.keys(savedCache), ['entries']);
			
			const savedEntries = savedCache.entries;
			assert.deepEqual(Object.keys(savedEntries), ['src/foo/foo.txt']);
			
			const savedEntry = savedEntries['src/foo/foo.txt'];
			assert.deepEqual(Object.keys(savedEntry), ['ctimeMs', 'hash', 'relFile']);
			assert.equal(savedEntry.relFile, 'src/foo/foo.txt');
			assert.equal(savedEntry.hash, fooHash);
		});
	});
	
	it('should use custom cacheFile name', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ cacheFile: 'zote-cache.json', cacheSave: true });
			const cache = new HashCache(settings);
			
			const relFile = 'src/foo/foo.txt';
			
			await cache.getFreshEntry(relFile);
			await cache.saveCache();
			const after = box.snapshot();
			
			const fileList = Object.keys(after);
			assert.deepEqual(fileList, [
				'src/foo/foo.txt',
				'zote-cache.json',
			]);
		});
	});
	
	it('should not create entries for nonexistent files', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions({ cacheSave: true });
			const cache = new HashCache(settings);
			const relFileFoo = 'src/foo/foo.txt';
			const relFileBar = 'src/foo/bar.txt'; // not there
	
			const entryFoo = await cache.getFreshEntry(relFileFoo);
			const entryBar = await cache.getFreshEntry(relFileBar);
			
			assert(entryFoo);
			assert(!entryBar);

			await cache.saveCache();
			const after = box.snapshot();
			
			const savedCache = JSON.parse(after['mojl-cache.json']);
			const savedEntries = savedCache.entries;
			assert.deepEqual(Object.keys(savedEntries), ['src/foo/foo.txt']);
		});
	});
	
	it('should read existing cache entries', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const relFile = 'src/foo/foo.txt';
			
			// Create cache entry
			const cache_1 = new HashCache({...settings, cacheSave: true});
			await cache_1.createEntry(relFile);
			await cache_1.saveCache(); 
			
			// Read cache entry
			const cache_2 = new HashCache(settings);
			const fresh_2 = await cache_2.readExistingEntry(relFile);
			assert(cache_2.entryIsFresh(fresh_2));
		});
	});
	
	it('should not read existing cache entries when cacheRead is false', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
			const settings = await expandOptions();
			const relFile = 'src/foo/foo.txt';
			
			// Create cache entry
			const cache_1 = new HashCache({...settings, cacheSave: true});
			await cache_1.createEntry(relFile);
			await cache_1.saveCache(); 
			
			// Read cache entry
			const cache_2 = new HashCache({...settings, cacheRead: false});
			const fresh_2 = await cache_2.readExistingEntry(relFile);
			assert(!cache_2.entryIsFresh(fresh_2));
		});
	});

});

