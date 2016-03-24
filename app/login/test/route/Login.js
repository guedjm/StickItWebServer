"use strict";

var config = require("config");
var supertest = require("supertest");
var querystring = require("querystring");

describe("Testing route /v1/oauth2/login", function () {

  const authServer = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route = "/v1/oauth2/login";
  const query = {
    response_type: "code",
    client_id: config.get("test.client.id"),
    redirect_uri: "http://google.fr"
  };
  const fullRoute = route + "?" + querystring.stringify(query);

  it("Sould display an login form", function (done) {
    authServer.get(route)
      .expect(200)
      .end(done);
  });

  it("Should redirect back to login form if bad credential", function (done) {
    authServer.post(route)
      .query(query)
      .type("form")
      .send({ email: "jifjei" })
      .send({ password: "fezfzefezfz" })
      .expect(302)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect back to login form if no data submit", function (done) {
    authServer.post(route)
      .query(query)
      .expect(302)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect to authorize form if valid credential", function (done) {
    const authRoute = "/v1/oauth2/authorize";
    const fullAuthRoute = authRoute + "?" + querystring.stringify(query);
    authServer.post(route)
      .query(query)
      .type("form")
      .send({ email: config.get("test.user")[0].email })
      .send({ password: config.get("test.user")[0].password })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", fullAuthRoute)
      .end(done);
  });
});
