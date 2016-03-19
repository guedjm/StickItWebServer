"use strict";

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');

gulp.task('lint', function () {
  const project = ts.createProject('./tsconfig.json');

  project.src()
    .pipe(tslint())
    .pipe(tslint.report("verbose"));
});