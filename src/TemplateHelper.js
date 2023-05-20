const fs = require('fs');
const path = require('path').posix;

const fileUrl = require('./fileUrl.js');
const linkUrl = require('./linkUrl.js');
const templateTagFn = require('./templateTagFn.js');
const ctimeCache = require('./ctimeCache.js');

function TemplateHelper(settings, urlDocument = '/index.html') {
	const {
		base,
		maxIncludeDepth,
		trimIncludes,
	} = settings;
	
	const stack = [];

	this.template = (strings, ...values) => {
		let outputPromise = templateTagFn(strings, ...values);
		if (trimIncludes) {
			outputPromise = outputPromise.then(output => output.trim());
		}
		return outputPromise;
	};
	
	this.exists = (module) => {
		return !!getTemplate(base, expandModule(base, stack, module));
	};
	
	this.include = (module, props = {}) => {
		if (stack.length >= maxIncludeDepth) {
			throw `maxIncludeDepth exceeded (${maxIncludeDepth})`;
		}
		
		module = expandModule(base, stack, module);
		let templatePath = getTemplate(base, module);
		
		if (!templatePath) {
			throw `No template found for module '${module}'`;
		}
		
		stack.push({module, templatePath});
		
		let outputPromise = includeTemplate(templatePath, this, props);
		
		stack.pop();
		
		return outputPromise;
	};
	
	this.file = (filePath, options) => {
		return fileUrl(settings, peek(stack).templatePath, urlDocument, filePath, options);
	};
	
	this.link = (linkPath) => {
		return linkUrl(settings, urlDocument, linkPath);
	};
}

const trimSlashes = /^\/+(.+?)\/+$/;
const isRelative = /^\.{1,2}(\/|$)/;
function expandModule(base, stack, module) {
	module = module.replace(trimSlashes, '$1');
	if (isRelative.test(module)) {
		if (stack.length === 0) {
			throw 'Relative module paths can only be used from inside templates.';
		}
		let moduleDir = path.join(base, stack[0].module);
		let moduleParent = path.dirname(moduleDir);
		let absoluteModule = path.resolve(path.join(moduleParent, module));
		module = path.relative(base, absoluteModule);
	}
	return module;
}

function getTemplate(base, module) {
	let modulePath = path.join(base, module);
	let templatePath = path.join(modulePath, path.basename(module) + '.tpl.js');
	if (!fileExists(templatePath)) {
		templatePath = modulePath + '.tpl.js';
		if (!fileExists(templatePath)) {
			return false;
		}
	}
	return templatePath;
}

// Returns a Promise
function includeTemplate(templatePath, mojlBuilder, props) {
	if (ctimeCache.freshen(templatePath)) {
		delete require.cache[templatePath];
	}
	let fn = require(templatePath);
	if (typeof fn !== 'function') {
		throw `Template must export a function (${templatePath})`;
	}
	let outputPromise = fn(mojlBuilder, props);
	if (!(outputPromise instanceof Promise)) {
		throw `Template function must return "mojl.template\`...\`" or other Promise (${templatePath})`;
	}
	return outputPromise;
}

function peek(stack) {
	return stack[stack.length - 1];
}

function fileExists(file) {
	return fs.existsSync(file) && fs.statSync(file).isFile();
}

module.exports = TemplateHelper;
