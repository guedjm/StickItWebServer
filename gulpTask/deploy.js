"use strict";

const gulp = require("gulp");
const runSequence = require("run-sequence");

gulp.task("push", function (cb) {
  runSequence(
    "format",
    "lint",
    "test",
    "bump",
    "exec-commit",
    "exec-push", cb);
});