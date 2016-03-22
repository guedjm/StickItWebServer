"use strict";

const gulp = require("gulp");
const mocha = require("gulp-mocha");

gulp.task("exec-test", function (cb) {
  return gulp.src("./build/test/Test.js")
    .pipe(mocha());
});