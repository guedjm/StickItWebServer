"use strict";

const gulp = require("gulp");
const config = require("config");
const mongoose = require("mongoose");

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
                cb();
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

gulp.task("wait", function (cb) {
  setTimeout(cb, 1000);
});