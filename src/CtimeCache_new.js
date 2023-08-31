const fs = require('fs');
const path = require('path').posix;
const crypto = require('crypto');
const writeFileRecursive = require('./writeFileRecursive.js');

// The hash is in base64, so replace the base64 characters
// that are reserved for URIs with characters that aren't.
// Seems nicer than url-encoding them, and since they never need
// to be decoded, they don't need to be standard base64 values.
const pattern = /[+=/]/g;
const map = {
	'+': '*',
	'=': '~',
	'/': '!'
};

const has = Object.prototype.hasOwnProperty;

class CtimeCache {
	#base;
	#cacheTTL;
	#cacheDir;
	#infix = 'hashes';
	#suffix = '.mojlcache';
	
	#memoryCache = {};
	
	// to-do: On read, if #lastPurged was at #cacheTTL ago or more,
	// then delete all the cache entries that are expired.
	// #lastPurged;
	
	constructor(settings) {
		this.#base = settings.base;
		this.#cacheTTL = settings.cacheTTL;
		this.#cacheDir = path.join(this.#base, settings.cacheDir, this.#infix);
	}
	
	async stamp(relFile) {
		const entry = this.fileChanged(relFile) ?
			(await this.readCacheEntry(relFile)) : 
			(await this.freshenCacheEntry(relFile));
		return `?h=${entry.hash}`;
	}
	
	fileChanged(relFile) {
		const absFile = path.join(this.#base, relFile);
		const cacheEntry = this.readCacheEntry(relFile);
		const ctimeMs = String(fs.existsSync(absFile) && fs.statSync(absFile).ctimeMs);
		return !cacheEntry || cacheEntry.ctimeMs !== ctimeMs;
	}
	
	async freshenCacheEntry(relFile) {
		const absFile = path.join(this.#base, relFile);
		const entry = {
			hash: this.#hash(absFile),
			ctimeMs: String(fs.existsSync(absFile) && fs.statSync(absFile).ctimeMs),
			expires: Date.now() + this.#cacheTTL,
		};
		this.#writeCacheEntry(relFile, entry);
		return entry;
	}
	
	async #hash(absFile) {
		if (fs.existsSync(absFile) && fs.statSync(absFile).isFile()) {
			let content = await fs.promises.readFile(absFile, 'binary');
			let sha = crypto.createHash('sha1');
			sha.update(content);
			return sha.digest('base64').replace(pattern, m => map[m]);
		} else {
			return 'not-found';
		}
	}
	
	async readCacheEntry(relFile) {
		if (has.call(this.#memoryCache, relFile)) {
			return this.#memoryCache[relFile];
		}
		const cacheAbsFile = this.#getCacheFileAbsPath(relFile);
		if (fs.existsSync(cacheAbsFile)) {
			const content = await fs.promises.readFile(cacheAbsFile, 'utf-8');
			let [hash, ctimeMs, expires] = content.trim().split(/\s+/);
			if (Date.now() <= parseInt(expires)) {
				const entry = { hash, ctimeMs, expires };
				this.#memoryCache[relFile] = entry;
				return entry;
			}
		}
	}

	async #writeCacheEntry(relFile, entry) {
		this.#memoryCache[relFile] = entry;
		const cacheAbsFile = this.#getCacheFileAbsPath(relFile);
		await writeFileRecursive(
			cacheAbsFile,
			`${entry.hash} ${entry.ctimeMs} ${entry.expires}`,
			'utf-8'
		);
	}

	async #deleteCache(relFile) {
		delete this.#memoryCache[relFile];
		const cacheAbsFile = this.#getCacheFileAbsPath(relFile);
		if (fs.existsSync(cacheAbsFile)) {
			await fs.promises.rm(cacheAbsFile);
		}
	}
	
	// Get the path of the cache file that corresponds to the supplied project file
	// regardless of whether either file exists.
	#getCacheFileAbsPath(relFile) {
		return path.join(this.#cacheDir, relFile + this.#suffix);
	}
	
}

module.exports = CtimeCache;
