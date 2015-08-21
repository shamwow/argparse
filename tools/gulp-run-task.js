var gulp = require('gulp');

// Accepts a sequence of tasks and optionally a callback.
module.exports = function (task) {
    gulp.start.apply(gulp, [].slice.call(arguments, 0));
};
