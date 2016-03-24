"use strict";

const config = require("config");
const supertest = require("supertest");

describe("Testing password grant flow", function () {

  const authServer = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route = "/v1/oauth2/token";

  it("Should reply tokens on password flow", function (done) {

    authServer.post(route)
      .send({ grant_type: "password" })
      .send({ username: config.get("test.user")[1].email })
      .send({ password: config.get("test.user")[1].password })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        else {
          let result = JSON.parse(res.text);
          if (result.access_token && result.refresh_token && result.expires_in && result.token_type) {
            done();
          }
          else {
            done(new Error("Invalid reply"));
          }
        }
      });
  });
});
