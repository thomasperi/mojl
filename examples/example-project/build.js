let Mojl = require('../../');

new Mojl().build({isDev: true}).then(() => {
	console.log('done');
});