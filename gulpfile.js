const gulp = require('gulp');
const watch = require('gulp-watch');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const runSequence = require('gulp4-run-sequence');

var files = {
	src: 'mojl.js',
	test: 'test/*/*.js',
};

// Make it easier to run tasks from inside other tasks.
var tasks = {},
	buildQueue = [];
function task(name, enqueue, fn) {
	tasks[name] = fn;
	if (enqueue) {
		buildQueue.push(name);
	}
}

var lint_settings = {
	'esversion': 9,
	'undef': true,
	'unused': true
};

task('lint', true, function() {
	return (gulp
		.src(files.src)
		.pipe(jshint(lint_settings))
		.pipe(jshint.reporter('default'))
	);
});

task('test', true, function () {
	return (gulp
		.src(files.test)
		.pipe(jshint(lint_settings))
		.pipe(jshint.reporter('default'))
		.pipe(mocha({
			'reporter': 'nyan',
		}))
	);
});

// Run tasks when changes are detected on certain files.
task('watch', false, function () {
	watch([
		files.src,
		files.test
	], tasks['default']);
});

// Run the tasks in series, in the order they were defined. 
task('default', false, function (callback) {
	runSequence(...buildQueue, callback);
});

// Actually define them as gulp tasks
for (var name in tasks) {
	gulp.task(name, tasks[name]);
}
