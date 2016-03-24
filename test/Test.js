"use strict";

const config = require("config");
const supertest = require("supertest");
const requiredir = require("require-dir");
const StickItServer = require("../build/bin/StickItServer").default;
const server = new StickItServer();
const authServer = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);

before(function (done) {
  console.log("Preparing database ...");
  server.disableLog();
  server.initialize(true);
  server.start();
  done();
});

describe("Testing StickItWeb server", function () {

  describe("App URL bindings", function () {

    it(`Auth server should reply to ${config.get("authServer.url")}:${config.get("server.port")}/ping route`, function (done) {
      authServer.get("/ping")
        .expect(200)
        .expect("Pong auth")
        .end(done);
    });
  });


  requiredir("../app/login/test");
});

after(function () {
  server.stop();
});
