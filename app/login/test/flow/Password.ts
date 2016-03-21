"use strict";

import * as config from "config";
import * as supertest from "supertest";

describe("Testing password grant flow", function(): void {

  const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const route: string = "/v1/oauth2/token";

  it("Should reply tokens on password flow", function(done: Function): void {

    authServer.post(route)
      .send({ grant_type: "password" })
      .send({ username: config.get("test.user.email") })
      .send({ password: config.get("test.user.password") })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(200)
      .end(function(err: any, res: any): void {
        if (err) {
          done(err);
        }
        else {
          let result: any = JSON.parse(res.text);
          if (result.access_token && result.refresh_token && result.expires_in && result.token_type) {
            done();
          }
          else {
            done(new Error());
          }
        }
      });
  });
});
