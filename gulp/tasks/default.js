var gulp = require('gulp');

gulp.task('default', ['lint','mocha','build', 'watch', 'serve', 'open']);
