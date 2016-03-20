"use strict";

import * as config from "config";
import * as supertest from "supertest";

describe("Testing route /v1/oauth2/login", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/login";

  it("Sould display an login form", function(done: Function): void {

    authServer.get(route)
      .expect(200)
      .end(done);
  });
});
