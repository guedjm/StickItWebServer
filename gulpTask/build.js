'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');

gulp.task('build', function () {
  const project = ts.createProject('./tsconfig.json');

  console.log("Building project ...");
  return project.src()
    .pipe(ts(project)).js
    .pipe(gulp.dest('build'));
});

gulp.task("clean", function () {
  console.log("Cleaning project ...")
  return gulp.src("./build", { read: false})
    .pipe(clean());
});