"use strict";

import * as config from "config";
import * as supertest from "supertest";
import * as querystring from "querystring";

describe("Testing route /v1/oauth2/login", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/login";
  const params: any = {
    response_type: "code",
    client_id: config.get<string>("test.client.id"),
    redirect_uri: "http://google.fr"
  };
  const fullRoute: string = route + "?" + querystring.stringify(params);

  it("Sould display an login form", function(done: Function): void {

    authServer.get(route)
      .expect(200)
      .end(done);
  });

  it("Should redirect back to login form if bad credential", function(done: Function): void {

    console.log(fullRoute);
    authServer.post(fullRoute)
      .field("email", "jifjei")
      .field("password", "jfioejie")
      .expect(301)
      .end(done);
  });

  it("Should redirect back to login form if no data submit");

  it("Should redirect to authorize form if valid creadential");
});
