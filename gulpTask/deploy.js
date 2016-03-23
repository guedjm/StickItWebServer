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
    "exec-push", function (err) {
      if (err) {
        cb(err);
      }
      else {
        const pkg = JSON.parse(fs.readFileSync("./package.json"));
        console.log("Version " + pkg.version + " successfuly pushed");
        cb(err);
      }
    });
});