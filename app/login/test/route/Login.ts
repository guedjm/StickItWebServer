"use strict";

import * as config from "config";
import * as supertest from "supertest";
import * as querystring from "querystring";

describe("Testing route /v1/oauth2/login", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/login";
  const query: any = {
    response_type: "code",
    client_id: config.get<string>("test.client.id"),
    redirect_uri: "http://google.fr"
  };
  const fullRoute: string = route + "?" + querystring.stringify(query);

  it("Sould display an login form", function(done: Function): void {

    authServer.get(route)
      .expect(200)
      .end(done);
  });

  it("Should redirect back to login form if bad credential", function(done: Function): void {
    authServer.post(route)
      .query(query)
      .type("form")
      .send({ email: "jifjei" })
      .send({ password: "fezfzefezfz" })
      .expect(302)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect back to login form if no data submit", function(done: Function): void {
    authServer.post(route)
      .query(query)
      .expect(302)
      .expect("Location", fullRoute)
      .end(done);
  });

  it("Should redirect to authorize form if valid credential", function(done: Function): void {

    const authRoute: string = "/v1/oauth2/authorize";
    const fullAuthRoute: string = authRoute + "?" + querystring.stringify(query);
    authServer.post(route)
      .query(query)
      .type("form")
      .send({ email: config.get<string>("test.user.email") })
      .send({ password: config.get<string>("test.user.password") })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", fullAuthRoute)
      .end(done);
  });
});
