"use strict";

import * as config from "config";
import * as supertest from "supertest";
import { expect } from "chai";
import StickItServer from "../bin/StickItServer";

const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
const requiredir: any = require("require-dir");

describe("Testing StickItWeb server", function (): void {

  before("Starting server ...", function (): void {
    const server: StickItServer = new StickItServer();
    server.disableLog();
    server.initialize();
    server.start();
  });

  describe("App URL bindings", function (): void {

    it(`Auth server should reply to ${config.get("authServer.url")}:${config.get("server.port")}/ping route`);
  });

  requiredir("../app/login/test");
});

