"use strict";

import * as config from "config";
import * as supertest from "supertest";
import StickItServer from "../bin/StickItServer";

const server: StickItServer = new StickItServer();
const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
const requiredir: any = require("require-dir");


before(function(done: Function): void {
  console.log("Preparing database ...");
  server.disableLog();
  server.initialize(true);
  server.start();
  done();
});

describe("Testing StickItWeb server", function(): void {
  describe("App URL bindings", function(): void {

    it(`Auth server should reply to ${config.get("authServer.url")}:${config.get("server.port")}/ping route`,
      function(done: Function): void {

        authServer.get("/ping")
          .expect(200)
          .expect("Pong auth")
          .end(done);
      });
  });
  requiredir("../app/login/test");
});

after(function(): void {
  server.stop();
});
