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

const infix = 'hashes';
const cleanFile = 'lastclean';
const suffix = '.mojlcache';

const has = Object.prototype.hasOwnProperty;

class CtimeCache {
	base;
	cacheDir;
	cacheSave;
	cacheCleanInterval;
	cleanFile;
	
	lastClean = 0;
	memoryCache = {};
	
	// to-do: On read, if lastClean was at cacheCleanInterval ago or more,
	// then delete all the cache entries that are expired.
	// lastPurged;
	
	constructor(settings) {
		this.base = settings.base;
		this.cacheSave = settings.cacheSave;
		this.cacheCleanInterval = settings.cacheCleanInterval;
		this.cacheDir = path.join(this.base, settings.cacheDir, infix);
		this.cleanFile = path.join(this.cacheDir, cleanFile);
	}
	
	async checkClean() {
		if (this.lastClean === 0 && this.cacheSave && fs.existsSync(this.cleanFile)) {
			this.lastClean = parseInt(fs.promises.readFile(this.cleanFile, 'utf-8').trim());
		}
		if (Date.now() > this.lastClean + this.cacheCleanInterval) {
			this.lastClean = Date.now();
			if (this.cacheSave) {
				await writeFileRecursive(this.cleanFile, String(this.lastClean), 'utf-8');
			}
			await this.cleanDir(this.cacheDir);
		}
	}
	
	async cleanDir(dir) {
		if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
			return;
		}
		for (let item of await fs.promises.readdir(dir)) {
			if (item === '.' || item === '..') {
				continue;
			}
			let itemPath = path.join(dir, item);
			let stat = fs.statSync(itemPath);
			if (stat.isDirectory()) {
				await this.cleanDir(itemPath);
			} else if (stat.isFile() && itemPath.endsWith(suffix)) {
				let relFile = this.getOrigFileRelPath(itemPath);
				let absFile = path.join(this.base, relFile);
				if (!fs.existsSync(absFile)) {
					this.deleteEntry(relFile);
				}
			}
		}
	}
	
	async stamp(relFile) {
		const entry = await this.getEntry(relFile);
		const stamp = entry ? entry.hash : 'not-found';
		return `?h=${stamp}`;
	}
	
	async stampAbs(absFile) {
		const relFile = path.relative(this.base, absFile);
		return this.stamp(relFile);
	}
	
	async getEntry(relFile) {
		if (!(await this.hasFreshEntry(relFile))) {
			await this.freshenEntry(relFile);
		}
		return await this.readEntry(relFile);
	}
	
	async hasFreshEntry(relFile) {
		const entry = await this.readEntry(relFile);
		if (!entry) {
			return false;
		}
		const absFile = path.join(this.base, relFile);
		if (!fs.existsSync(absFile)) {
			return false;
		}
		return entry.ctimeMs === this.getCtimeMs(absFile);
	}
	
	async freshenEntry(relFile) {
		await this.checkClean();
		const absFile = path.join(this.base, relFile);
		const hash = await this.hash(absFile);
		if (hash) {
			const ctimeMs = this.getCtimeMs(absFile);
			const entry = { hash, ctimeMs };
			await this.writeEntry(relFile, entry);
		}
	}
	
	async hash(absFile) {
		if (fs.existsSync(absFile) && fs.statSync(absFile).isFile()) {
			let content = await fs.promises.readFile(absFile, 'binary');
			let sha = crypto.createHash('sha1');
			sha.update(content);
			return sha.digest('base64').replace(pattern, m => map[m]);
		}
	}
	
	getCtimeMs(absFile) {
		return String(fs.statSync(absFile).ctimeMs);
	}
	
	async readEntry(relFile) {
		if (has.call(this.memoryCache, relFile)) {
			return { ...this.memoryCache[relFile] };
		} else if (this.cacheSave) {
			const cacheAbsFile = this.getCacheFileAbsPath(relFile);
			if (fs.existsSync(cacheAbsFile)) {
				const entry = this.readEntryFile(cacheAbsFile);
				this.memoryCache[relFile] = entry;
				return entry;
			}
		}
	}
	
	async readEntryFile(cacheAbsFile) {
		const entryString = await fs.promises.readFile(cacheAbsFile, 'utf-8');
		const [ hash, ctimeMs ] = entryString.trim().split(/\s+/);
		return { hash, ctimeMs };
	}

	async writeEntry(relFile, entry) {
		this.memoryCache[relFile] = { ...entry };
		if (this.cacheSave) {
			const cacheAbsFile = this.getCacheFileAbsPath(relFile);
			await writeFileRecursive(
				cacheAbsFile,
				`${entry.hash} ${entry.ctimeMs}`,
				'utf-8'
			);
		}
	}

	async deleteEntry(relFile) {
		delete this.memoryCache[relFile];
		if (this.cacheSave) {
			const cacheAbsFile = this.getCacheFileAbsPath(relFile);
			if (fs.existsSync(cacheAbsFile)) {
				await fs.promises.rm(cacheAbsFile);
			}
		}
	}
	
	// Get the path of the cache file that corresponds to the supplied project file
	// regardless of whether either file exists.
	getCacheFileAbsPath(relFile) {
		return path.join(this.cacheDir, relFile + suffix);
	}
	
	// Get the path of the cache file that corresponds to the supplied project file
	// regardless of whether either file exists.
	getOrigFileRelPath(absCacheFile) {
		return path.relative(this.cacheDir, absCacheFile.slice(0, -suffix.length));
	}
	
}

module.exports = CtimeCache;

