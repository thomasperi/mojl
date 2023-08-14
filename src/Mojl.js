const expandOptions = require('./expandOptions.js');
const buildDevLoaderFile = require('./buildDevLoaderFile.js');
const buildMonolithFile = require('./buildMonolithFile.js');
const buildTranspilerFile = require('./buildTranspilerFile.js');
const buildDocumentFile = require('./buildDocumentFile.js');
const buildDocumentFilesAll = require('./buildDocumentFilesAll.js');
const deleteBuild = require('./deleteBuild.js');
const mirrorAssets = require('./mirrorAssets.js');

const has = Object.prototype.hasOwnProperty;

const nonOverridables = ['base', 'collations'];

// to-do:
// test new methods

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
	
	async #overrideWith(options = {}) {
		const result = {...(await this.#optionsPromise)};
		Object.keys(result).forEach(key => {
			if (has.call(options, key)) {
				if (nonOverridables.includes(key)) {
					throw `can't override '${key}' option`;
				}
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
	
	#noDelete(method) {
		if (this.#busyDelete) {
			throw `Can't call ${method} while deleting a previous build`;
		}
	}
	
	#noSame(flag, method) {
		this.#noDelete(method);
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
	
	async build(options) {
		this.#noOther('build');
		await this.#busyTry('#busyBuild', async () => {
			await this.deleteBuild(options);
			await Promise.all([
				this.buildStyles(options),
				this.buildScripts(options),
				this.mirrorAssets(options),
			]);
			await this.buildTemplatesAuto(options);
		});
	}

	async buildTemplate(docPrefix, module, props, options) {
		this.#noDelete('buildTemplate');
		options = await this.#overrideWith(options);
		await buildDocumentFile(options, module, props, docPrefix);
	}

	async buildScripts(options) {
		this.#noSame(this.#busyScripts, 'buildScripts');
		options = await this.#overrideWith(options);
		await this.#busyTry('#busyScripts', async () => {
			if (options.isDev) {
				await buildDevLoaderFile(options, 'js');
			} else {
				await buildMonolithFile(options, 'js');
			}
		});
	}
	
	async buildStyles(options) {
		this.#noSame(this.#busyStyles, 'buildStyles');
		options = await this.#overrideWith(options);
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

	async buildTemplatesAuto(options) {
		this.#noSame(this.#busyTemplates, 'buildTemplatesAuto');
		options = await this.#overrideWith(options);
		await this.#busyTry('#busyTemplates', async () => {
			if (options.templateHomeModule) {
				await buildDocumentFilesAll(options);
			}
		});
	}
	
	async deleteBuild(options) {
		this.#noOther('deleteBuild');
		options = await this.#overrideWith(options);
		await this.#busyTry('#busyDelete', async () => {
			await deleteBuild(options);
		});
	}
	
	async getBase() {
		return (await this.#optionsPromise).base;
	}
	
	async getModuleList() {
		return [...(await this.#optionsPromise).modules];
	}
	
	async mirrorAssets(options) {
		this.#noSame(this.#busyMirror, 'mirrorAssets');
		options = await this.#overrideWith(options);
		await this.#busyTry('#busyMirror', async () => {
			await mirrorAssets(options);
		});
	}
}

module.exports = Mojl;