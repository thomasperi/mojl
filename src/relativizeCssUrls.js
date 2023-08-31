const path = require("path").posix;

const rewriteCssUrls = require('./rewriteCssUrls.js');

const absoluteUrlRegExp = /^(\/|(\w+:\/\/))/;

async function relativizeCssUrls(
	settings, cssCode, cssSourceFile, cssDestFile, baseDest, assetList
) {
	let baseSource = settings.base;
	let cssSourceDir = path.dirname(cssSourceFile);
	let cssDestDir = path.dirname(cssDestFile);
	return rewriteCssUrls(cssCode, async (url) => {
		if (absoluteUrlRegExp.test(url)) {
			return url;
		}
		let urlSourcePath = path.join(cssSourceDir, url);
		let urlSourcePathProjectRelative = path.relative(baseSource, urlSourcePath);
		let urlDestPath = path.join(baseDest, urlSourcePathProjectRelative);

		let assetHash = await settings._cache.stampAbs(urlSourcePath);
		
		assetList.push(urlSourcePathProjectRelative);
		return path.relative(cssDestDir, urlDestPath) + assetHash;
	});
}

module.exports = relativizeCssUrls;