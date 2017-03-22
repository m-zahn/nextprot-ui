var gulp = require('gulp');
var dest = require('dest');
var del = require('del');
var vulcanize = require('gulp-vulcanize');

gulp.task('clean', function(cb) {
    del(['./build/elements/**'], cb);
});

gulp.task('vulcanize', function() {
    return gulp.src('./bower_components/nextprot-elements/function-view.html')
        .pipe(vulcanize({
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./build/elements/'));
});

gulp.task('vulcanize-blast', function() {
    return gulp.src('./bower_components/nextprot-elements/blast-view.html')
        .pipe(vulcanize({
            strip: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('./build/elements/'));
});

gulp.task('default', ['clean', 'vulcanize', 'vulcanize-blast']);
