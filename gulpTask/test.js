"use strict";

const gulp = require("gulp");
const mocha = require("gulp-mocha");
const runSequence = require("run-sequence");

gulp.task("exec-test", function (cb) {
  return gulp.src("./build/test/Test.js", {read: false})
    .pipe(mocha());
});

gulp.task("test", function (cb) {

  runSequence(
    "build",
    "db-test-clean",
    "wait",
    "db-test-init",
    "exec-test"
    , cb);
});