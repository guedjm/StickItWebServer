"use strict";

var config = require("config");
var supertest = require("supertest");

describe("Testing route /v1/oauth2/token", function () {

  const authServer = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route = "/v1/oauth2/token";

  it("Should reply insuported grant type no query", function (done) {
    authServer.post(route)
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(501)
      .end(done);
  });

  it("Should reply insuported grant type if invalid grant", function (done) {
    authServer.post(route)
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .query({ grant_type: "toto" })
      .expect(501)
      .end(done);
  });

  it("Should unauthorized request with unanthenticated request", function (done) {
    authServer.post(route)
      .query({ grant_type: "password", username: config.get("test.user")[0].email, password: config.get("test.user")[0].password })
      .expect(401)
      .end(done);
  });

  it("Should reply forbidden on password grant with invalid credentials", function (done) {
    authServer.post(route)
      .send({ grant_type: "password" })
      .send({ username: "jiojoi" })
      .send({ password: "jiojoij" })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(403)
      .end(done);
  });
});
