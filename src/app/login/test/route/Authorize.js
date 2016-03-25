"use strict";

var config = require("config");
var cheerio = require("cheerio");
var supertest = require("supertest");
var querystring = require("querystring");

describe("Testing route /v1/oauth2/authorize", function () {

  const authServer = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const loggedAgent = supertest.agent(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route = "/v1/oauth2/authorize";
  const loginRoute = "/v1/oauth2/login";
  const query = {
    response_type: "code",
    client_id: config.get("test.client.id"),
    redirect_uri: "http://google.fr"
  };
  const fullRoute = route + "?" + querystring.stringify(query);
  let transacId;

  before(function (done) {
    loggedAgent.post(loginRoute)
      .query(query)
      .type("form")
      .send({ email: config.get("test.user")[0].email })
      .send({ password: config.get("test.user")[0].password })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect user back to login form if not logged", function (done) {
    const loginUri = `${loginRoute}?${querystring.stringify(query)}`;
    authServer.get(route)
      .query(query)
      .redirects(0)
      .expect(302)
      .expect("Location", loginUri)
      .end(done);
  });

  it("Should display an authorize form", function (done) {
    loggedAgent.get(route)
      .query(query)
      .expect(200)
      .end(function (err, res) {
        let $ = cheerio.load(res.text);
        transacId = $("input[name=transaction_id]").attr("value");
        done();
      });
  });

  it("Should replay Bad Request if empty body", function (done) {
    loggedAgent.post(route)
      .query(query)
      .expect(400)
      .end(done);
  });

  it("Should redirect user back to redirectUri if access denied", function (done) {
    loggedAgent.post(route)
      .query(query)
      .redirects(0)
      .type("form")
      .send({ cancel: "" })
      .send({ transaction_id: transacId })
      .expect(302)
      .expect("Location", `${(config.get("test.client.redirectUri"))[0]}/?error=access_denied`)
      .end(done);
  });

  it("Should redirect user to redirectUri with code if access granted", function (done) {
    loggedAgent.get(route)
      .query(query)
      .expect(200)
      .end(function (err, res) {
        let $ = cheerio.load(res.text);
        transacId = $("input[name=transaction_id]").attr("value");
        loggedAgent.post(route)
          .query(query)
          .redirects(0)
          .type("form")
          .send({ allow: "" })
          .send({ transaction_id: transacId })
          .expect(302)
          .expect("Location", new RegExp(`${config.get("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
          .end(done);
      });
  });

  it("Should redirect user to redirectUri with code if user decision already exists", function (done) {
    loggedAgent.get(route)
      .query(query)
      .redirects(0)
      .expect(302)
      .expect("Location", new RegExp(`${config.get("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
      .end(done);
  });
});
