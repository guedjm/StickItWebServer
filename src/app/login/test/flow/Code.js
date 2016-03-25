"use strict";

var config = require("config");
var cheerio = require("cheerio");
var supertest = require("supertest");
var querystring = require("querystring");

describe("Testing code grant flow", function () {
  let code;
  let transacId;
  const authServer = supertest.agent(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const query = {
    response_type: "code",
    client_id: config.get("test.client.id"),
    redirect_uri: "http://google.fr"
  };

  it("Should display login form", function (done) {

    authServer.get("/v1/oauth2/login")
      .query(query)
      .expect(200)
      .end(done);
  });

  it("Should redirect to authorize form when log in", function (done) {
    const expectedRoute = "/v1/oauth2/authorize?" + querystring.stringify(query);

    authServer.post("/v1/oauth2/login")
      .query(query)
      .type("form")
      .send({ email: config.get("test.user")[1].email })
      .send({ password: config.get("test.user")[1].password })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", expectedRoute)
      .end(done);
  });

  it("Should display authorization form", function (done) {

    authServer.get("/v1/oauth2/authorize")
      .query(query)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        else {
          let $ = cheerio.load(res.text);
          transacId = $("input[name=transaction_id]").attr("value");
          done();
        }
      });
  });

  it("Should redirect to redirectUri with code when validating authorization", function (done) {

    authServer.post("/v1/oauth2/authorize")
      .query(query)
      .redirects(0)
      .type("form")
      .send({ allow: "" })
      .send({ transaction_id: transacId })
      .expect(302)
      .expect("Location", new RegExp(`${config.get("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        else {
          code = res.header.location.split("=")[1];
          done(err);
        }
      });
  });

  it("Should reply an access_token when exchanging code", function (done) {

    authServer.post("/v1/oauth2/token")
      .type("form")
      .send({ grant_type: "authorization_code" })
      .send({ redirect_uri: config.get("test.client.redirectUri")[0] })
      .send({ code: code })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(200)
      .end(function (err, res) {
        const result = JSON.parse(res.text);
        if (!result.access_token || !result.refresh_token || !result.expire_in || !result.token_type) {
          done(new Error("Invalid reply"));
        }
        else {
          done(err);
        }
      });
  });
});
