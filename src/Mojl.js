const expandOptions = require('./expandOptions.js');
const buildDevLoaderFile = require('./buildDevLoaderFile.js');
const buildMonolithFile = require('./buildMonolithFile.js');
const buildTranspilerFile = require('./buildTranspilerFile.js');
const buildDocumentFilesAll = require('./buildDocumentFilesAll.js');
const deleteBuild = require('./deleteBuild.js');
const mirrorAssets = require('./mirrorAssets.js');

const has = Object.prototype.hasOwnProperty;

class Mojl {
	#optionsPromise;
	#busyDelete = false;
	#busyBuild = false;
	#busyStyles = false;
	#busyScripts = false;
	#busyMirror = false;
	#busyTemplates = false;
	
	constructor(options = {}) {
		this.#optionsPromise = expandOptions(options);
	}
	
	async #overrideWith(options = {}, ...keys) {
		const result = {...(await this.#optionsPromise)};
		keys.forEach(key => {
			if (has.call(options, key)) {
				result[key] = options[key];
			}
		});
		return result;
	}
	
	#noOther(method) {
		if (
			this.#busyDelete ||
			this.#busyBuild ||
			this.#busyStyles ||
			this.#busyScripts ||
			this.#busyMirror ||
			this.#busyTemplates
		) {
			throw `Can't call ${method} while an async method is already running`;
		}
	}
	
	#noSame(flag, method) {
		if (this.#busyDelete) {
			throw `Can't call ${method} while deleting a previous build`;
		}
		if (flag) {
			throw `Can't call ${method} while it's already running`;
		}
	}
	
	async #busyTry(flagName, callback) {
		try {
			this[flagName] = true;
			await callback();
		} finally {
			this[flagName] = false;
		}
	}
	
	async listModules() {
		return [...(await this.#optionsPromise).modules];
	}
	
	async deleteBuild(options) {
		this.#noOther('deleteBuild');
		options = await this.#overrideWith(options, 'isDev');
		await this.#busyTry('#busyDelete', async () => {
			await deleteBuild(options);
		});
	}
	
	async buildStyles(options) {
		this.#noSame(this.#busyStyles, 'buildStyles');
		options = await this.#overrideWith(options, 'isDev');
		await this.#busyTry('#busyStyles', async () => {
			if (options.cssTranspilerAdaptor) {
				await buildTranspilerFile(options);
			} else if (options.isDev) {
				await buildDevLoaderFile(options, 'css');
			} else {
				await buildMonolithFile(options, 'css');
			}
		});
	}

	async buildScripts(options) {
		this.#noSame(this.#busyScripts, 'buildScripts');
		options = await this.#overrideWith(options, 'isDev');
		await this.#busyTry('#busyScripts', async () => {
			if (options.isDev) {
				await buildDevLoaderFile(options, 'js');
			} else {
				await buildMonolithFile(options, 'js');
			}
		});
	}
	
	async buildTemplates(options) {
		this.#noSame(this.#busyTemplates, 'buildTemplates');
		options = await this.#overrideWith(options, 'isDev');
		await this.#busyTry('#busyTemplates', async () => {
			if (options.templateHomeModule) {
				await buildDocumentFilesAll(options);
			}
		});
	}
	
	async mirrorAssets(options) {
		this.#noSame(this.#busyMirror, 'mirrorAssets');
		options = await this.#overrideWith(options, 'isDev');
		await this.#busyTry('#busyMirror', async () => {
			await mirrorAssets(options);
		});
	}

	async build(options) {
		this.#noOther('build');
		await this.#busyTry('#busyMirror', async () => {
			await this.deleteBuild(options);
			await Promise.all([
				this.buildStyles(options),
				this.buildScripts(options),
				this.mirrorAssets(options),
				this.buildTemplates(options)
			]);
		});
	}
}

module.exports = Mojl;