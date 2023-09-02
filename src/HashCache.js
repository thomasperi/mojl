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

class HashCache {
	#base = '';
	#cacheFile = '';
	#cacheTTL = 0;
	#cache = null;
	#jsonString = '';
	
	constructor(settings) {
		this.#base = settings.base;
		if (settings.cacheFile) {
			this.#cacheFile = path.join(settings.base, settings.cacheFile);
			this.#cacheTTL = settings.cacheTTL;
		}
	}
	
	async stamp(relFile) {
		const entry = await this.getFreshEntry(relFile);
		const stamp = entry ? entry.hash : 'not-found';
		return `?h=${stamp}`;
	}
	
	async stampAbs(absFile) {
		const relFile = path.relative(this.#base, absFile);
		return await this.stamp(relFile);
	}

	getMtime(absFile) {
		return Math.floor(fs.statSync(absFile).mtimeMs / 1000);
	}
	
	async getCache() {
		if (!this.#cache) {
			if (this.#cacheFile && fs.existsSync(this.#cacheFile)) {
				this.#jsonString = await fs.promises.readFile(this.#cacheFile, 'utf8');
				this.#cache = JSON.parse(this.#jsonString);
			} else {
				this.#cache = { entries: {}, expires: 0 };
			}
		}
		return this.#cache;
	}
	
	async readExistingEntry(relFile) {
		return (await this.getCache()).entries[relFile];
	}
	
	async getFreshEntry(relFile) {
		let entry = await this.readExistingEntry(relFile);
		if (!this.entryIsFresh(entry)) {
			entry = await this.createEntry(relFile);
		}
		return entry; // undefined if the file doesn't exist
	}
	
	entryIsFresh(entry) {
		if (!entry) {
			return false;
		}
		const absFile = path.join(this.#base, entry.relFile);
		return fs.existsSync(absFile) && (entry.mtime === this.getMtime(absFile));
	}
	
	async createEntry(relFile) {
		// Before adding new entries is a good time to purge entries for files
		// that don't exist anymore, but not *every* time an entry is added.
		const now = Date.now();
		if (this.#cache && now > this.#cache.expires) {
			this.#cache.expires = now + this.#cacheTTL;
			const { entries } = this.#cache;
			for (let relFile of Object.keys(entries)) {
				let absFile = path.join(this.#base, relFile);
				if (!fs.existsSync(absFile)) {
					delete entries[relFile];
				}
			}
		}
		
		// Get on with creating an entry.
		const absFile = path.join(this.#base, relFile);
		const hash = await this.createHash(absFile);
		if (hash) {
			const mtime = this.getMtime(absFile);
			const entry = { mtime, hash, relFile };
			(await this.getCache()).entries[relFile] = entry;
			return entry;
		}
	}
	
	async getHash(relFile) {
		let entry = this.getFreshEntry(relFile);
		if (!this.entryIsFresh(entry)) {
			entry = this.createEntry(relFile);
		}
		if (entry) {
			return entry.hash;
		}
	}
	
	async createHash(absFile) {
		if (fs.existsSync(absFile) && fs.statSync(absFile).isFile()) {
			let content = await fs.promises.readFile(absFile, 'binary');
			let sha = crypto.createHash('sha1');
			sha.update(content);
			return sha.digest('base64').replace(pattern, m => map[m]);
		}
	}

	async saveCache() {
		if (this.#cache && this.#cacheFile) {
			const newJsonString = JSON.stringify(this.#cache);
			if (newJsonString !== this.#jsonString) {
				await writeFileRecursive(this.#cacheFile, newJsonString, 'utf8');
			}
		}
	}
	
}

module.exports = HashCache;