"use strict";

const gulp = require("gulp");
const mocha = require("gulp-mocha");
const istambul = require("gulp-istanbul");
const runSequence = require("run-sequence");

gulp.task("pre-test", function () {
  return gulp.src(['./build/src/**/**/**/*.js'])
    .pipe(istambul())
    .pipe(istambul.hookRequire());
});

gulp.task("exec-test", function () {
  console.log("Executing tests ...");
  return gulp.src("./test/Test.js")
    .pipe(mocha())
    .pipe(istambul.writeReports({
      reporters: [ 'html', 'text', 'text-summary'],
    }))
    .pipe(istambul.enforceThresholds({
      thresholds: { global: 30 }
    }));
});

gulp.task("test", function (cb) {

  console.log("Preparing tests ...");
  runSequence(
    "build",
    "pre-test",
    "db-test-clean",
    "wait",
    "db-test-init",
    "exec-test",
    cb);
});