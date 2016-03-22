"use strict";

const gulp = require('gulp');
const git = require('gulp-git');
const prompt = require("gulp-prompt");

gulp.task("commit", function () {
  gulp.src("./")
    .pipe(prompt.prompt({
      type: 'input',
      name: 'msg',
      message: "Commit message :"
    }, function (res) {
      if (!res.msg || res.msg.length == 0) {
        console.log("Please enter a valid commit message");
      }
      else {

        gulp.src("./")
          .pipe(git.commit(res.msg, {args: "-a"}))
      }
    }));
});

gulp.task("push", function () {
  gulp.src("./")
    git.push("origin", "master", function (err) {
      if (err) {
        throw err;
      }
    });
});
