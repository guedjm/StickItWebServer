"use strict";

import * as config from "config";
import * as supertest from "supertest";

describe("Testing route /v1/oauth2/token", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/token";

  it("Should reply insuported grant type no query", function(done: Function): void {
    authServer.post(route)
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(501)
      .end(done);
  });


  it("Should reply insuported grant type if invalid grant", function(done: Function): void {
    authServer.post(route)
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .query({ grant_type: "toto" })
      .expect(501)
      .end(done);
  });

  it("Should unauthorized request with unanthenticated request", function(done: Function): void {
    authServer.post(route)
      .query({ grant_type: "password", username: config.get("test.user.email"), password: config.get("test.user.password") })
      .expect(401)
      .end(done);
  });

  it("Should reply forbidden on password grant with invalid credentials", function(done: Function): void {
    authServer.post(route)
      .send({ grant_type: "password" })
      .send({ username: "jiojoi" })
      .send({ password: "jiojoij" })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(403)
      .end(done);
  });
});
