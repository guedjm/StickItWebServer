"use strict";

const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('format', shell.task(['tsfmt -r']));