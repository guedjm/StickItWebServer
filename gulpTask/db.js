"use strict";

const gulp = require("gulp");
const config = require("config");
const mongoose = require("mongoose");
const prompt = require("gulp-prompt");

gulp.task("db-test-clean", function (cb) {

  mongoose.connection.once("open", function () {
    console.log("Database connection initialized");
    mongoose.connection.db.dropDatabase(function (err, result) {

      console.log("Test database dropped");
      mongoose.disconnect( function () {
        cb(err);
      });
    });
  });

  mongoose.connection.once("error", function () {
    console.error("Unable to connect to the database");
  });

  mongoose.connect(`mongodb://${config.get("dbConfig.host")}:${config.get("dbConfig.port")}/${config.get("test.dbConfig.dbName")}`);
});

gulp.task("db-test-init", function (cb) {

  const userDocumentModel = require("../build/src/app/login/model/User").userDocumentModel;
  const clientDocumentModel = require("../build/src/app/login/model/Client").clientDocumentModel;

  mongoose.connection.once("open", function () {
    console.log("Database connection initialized");

    userDocumentModel.createUser(config.get("test.user")[0].email, config.get("test.user")[0].password, function (err, user) {
      if (err) {
        cb(err);
      }
      else {
        console.log("Test user 1 created");
        userDocumentModel.createUser(config.get("test.user")[1].email, config.get("test.user")[1].password, function (err, user) {
          if (err) {
            cb(err);
          }
          else {
            console.log("Test user 2 created");
            clientDocumentModel.create({
              id: config.get("test.client.id"),
              secret: config.get("test.client.secret"),
              type: 2,
              name: config.get("test.client.name"),
              redirectURI: config.get("test.client.redirectUri"),
              creationDate: new Date(),
              activated: true
            }, function (err, client) {
              if (err) {
                cb(err);
              }
              else {
                console.log("Test client created");
                mongoose.disconnect( function () {
                  cb(err);
                });
              }
            });
          }
        });
      }
    });
  });

  mongoose.connection.once("error", function () {
    console.error("Unable to connect to the database");
  });

  mongoose.connect(`mongodb://${config.get("dbConfig.host")}:${config.get("dbConfig.port")}/${config.get("test.dbConfig.dbName")}`);
});

gulp.task("db-create-user", function (cb) {

  mongoose.connection.once("open", function () {
    console.log("Database connection initialized");

    gulp.src("./")
      .pipe(prompt.prompt({
        name: "email",
        message: "Email :",
        type: "input"
      }, function (res) {

        const email = res.email;
        gulp.src("./")
          .pipe(prompt.prompt({
            name: "password",
            message: "Password :",
            type: "input"
          }, function (res) {

            const password = res.password;

            const userDocumentModel = require("../build/src/app/login/model/User").userDocumentModel;
            userDocumentModel.createUser(email, password, function (err, user) {
              if (err) {
                cb(err);
              }
              else {
                console.log("User created");
                console.log(user);
                mongoose.disconnect( function () {
                  cb();
                });
              }
            });
          }));
      }));
  });

  mongoose.connection.once("error", function () {
    console.error("Unable to connect to the database");
  });

  mongoose.connect(`mongodb://${config.get("dbConfig.host")}:${config.get("dbConfig.port")}/${config.get("dbConfig.dbName")}`);

});

gulp.task("db-create-client", function (cb) {
  mongoose.connection.once("open", function () {
    console.log("Database connection initialized");

    gulp.src("./")
      .pipe(prompt.prompt({
        name: "name",
        message: "Name :",
        type: "input"
      }, function (res) {

        const name = res.name;
        gulp.src("./")
          .pipe(prompt.prompt({
            name: "ctype",
            message: "Type :",
            type: "checkbox",
            choices: ["1", "2", "3"]
          }, function (res) {

            const type = res.ctype;

            const clientDocumentModel = require("../build/src/app/login/model/Client").clientDocumentModel;
            clientDocumentModel.createClient(name, parseInt(type), function (err, client) {
              if (err) {
                cb(err);
              }
              else {
                console.log("Client created");
                console.log(client);
                mongoose.disconnect( function () {
                  cb();
                });
              }
            });
          }));
      }));
  });

  mongoose.connection.once("error", function () {
    console.error("Unable to connect to the database");
  });

  mongoose.connect(`mongodb://${config.get("dbConfig.host")}:${config.get("dbConfig.port")}/${config.get("dbConfig.dbName")}`);
});

gulp.task("wait", function (cb) {
  setTimeout(cb, 1000);
});