var gulp = require('gulp'),
	mocha = require('gulp-mocha');

// mocha that shit JS
gulp.task('mocha', function() {
	return gulp.src('tests/*.js')
		.pipe(mocha({
			reporter: 'nyan' 
		}));
});
