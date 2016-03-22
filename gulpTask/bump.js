"use strict";

const gulp = require("gulp");
const bump = require("gulp-bump");
const prompt = require("gulp-prompt");


gulp.task("bump", function (cb) {
  gulp.src("./")
    .pipe(prompt.prompt({
      type: "checkbox",
      name: "bumpType",
      message: "What type of bump would you like to do",
      choices: ["patch", "minor", "major"],
    }, function (res) {

      if (!res.bumpType || res.bumpType.length != 1) {
        console.log("Invalid bump type");
      }
      else {
        const bumpType = res.bumpType[0];

        gulp.src("./package.json")
          .pipe(bump({ type: bumpType }))
          .pipe(gulp.dest("./"));
        console.log("Version updated !");
        cb();
      }
    }));
});

gulp.task("bump-patch", function () {

  return gulp.src("./package.json")
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest("./"));
});

gulp.task("bump-minor", function () {

  return gulp.src("./package.json")
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest("./"));
});

gulp.task("bump-major", function () {

  return gulp.src("./package.json")
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest("./"));
});
