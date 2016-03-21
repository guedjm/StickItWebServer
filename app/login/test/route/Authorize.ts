"use strict";

import * as config from "config";
import * as cheerio from "cheerio";
import * as supertest from "supertest";
import * as querystring from "querystring";

describe("Testing route /v1/oauth2/authorize", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const loggedAggent: any = supertest.agent(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/authorize";
  const loginRoute: string = "/v1/oauth2/login";
  const query: any = {
    response_type: "code",
    client_id: config.get<string>("test.client.id"),
    redirect_uri: "http://google.fr"
  };
  const fullRoute: string = route + "?" + querystring.stringify(query);
  let transacId: string;

  before(function(done: Function): void {

    loggedAggent.post(loginRoute)
      .query(query)
      .type("form")
      .send({ email: config.get<string>("test.user.email") })
      .send({ password: config.get<string>("test.user.password") })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect user back to login form if not logged", function(done: Function): void {
    const loginUri: string = `${loginRoute}?${querystring.stringify(query)}`;
    authServer.get(route)
      .query(query)
      .redirects(0)
      .expect(302)
      .expect("Location", loginUri)
      .end(done);
  });

  it("Should display an authorize form", function(done: Function): void {
    loggedAggent.get(route)
      .query(query)
      .expect(200)
      .end(function(err: any, res: any): void {
        let $: any = cheerio.load(res.text);
        transacId = $("input[name=transaction_id]").attr("value");
        done();
      });
  });


  it("Should replay Bad Request if empty body", function(done: Function): void {
    loggedAggent.post(route)
      .query(query)
      .expect(400)
      .end(done);
  });

  it("Should redirect user back to redirectUri if access denied", function(done: Function): void {
    loggedAggent.post(route)
      .query(query)
      .redirects(0)
      .type("form")
      .send({ cancel: "" })
      .send({ transaction_id: transacId })
      .expect(302)
      .expect("Location", `${(config.get<[string]>("test.client.redirectUri"))[0]}/?error=access_denied`)
      .end(done);
  });

  it("Should redirect user to redirectUri with code if access granted", function(done: Function): void {
    loggedAggent.get(route)
      .query(query)
      .expect(200)
      .end(function(err: any, res: any): void {
        let $: any = cheerio.load(res.text);
        transacId = $("input[name=transaction_id]").attr("value");

        loggedAggent.post(route)
          .query(query)
          .redirects(0)
          .type("form")
          .send({ allow: "" })
          .send({ transaction_id: transacId })
          .expect(302)
          .expect("Location",
          new RegExp(`${config.get<[string]>("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
          .end(done);
      });
  });


  it("Should redirect user to redirectUri with code if user decision already exists", function(done: Function): void {
    loggedAggent.get(route)
      .query(query)
      .redirects(0)
      .expect(302)
      .expect("Location",
      new RegExp(`${config.get<[string]>("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
      .end(done);
  });
});
