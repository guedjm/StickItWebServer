'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');

gulp.task('build', function () {
  const project = ts.createProject('./tsconfig.json');

  return project.src()
    .pipe(ts(project)).js
    .pipe(gulp.dest('build'));
});
