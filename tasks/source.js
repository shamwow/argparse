var babel = require('gulp-babel');
var gulp = require('gulp');
var grun = require('../tools/gulp-run-task');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');

var compile = function(){
    return gulp.src('./src/**/*')
        .pipe(sourcemaps.init())
        .pipe(babel({
            optional: ['es7.asyncFunctions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
};

var watch = function(){
    gulp.watch('./src/**/*.js', function () {
        gutil.log('Source files changed, recompiling...');
        grun('compile:source');
    });
};

gulp.task('compile:source', compile);
gulp.task('watch:source', ['compile:source'], watch);
