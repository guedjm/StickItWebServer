"use strict";

import * as config from "config";
import * as cheerio from "cheerio";
import * as supertest from "supertest";
import * as querystring from "querystring";
import modelManager from "../../model/ModelManager";
import { IUserDocumentModel, IUserDocument } from "../../model/User";
import { IUserDecisionDocumentModel } from "../../model/UserDecision";


describe("Testing code grant flow", function(): void {

  let code: string;
  let transacId: string;
  const authServer: any = supertest.agent(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
  const query: any = {
    response_type: "code",
    client_id: config.get<string>("test.client.id"),
    redirect_uri: "http://google.fr"
  };

  before(function(done: Function): void {
    const userModel: IUserDocumentModel = modelManager.getUserModel();
    const userDecisionModel: IUserDecisionDocumentModel = modelManager.getUserDecisionModel();

    userModel.findUserByEmail(config.get<string>("test.user.email"),
      function(err: any, user: IUserDocument): void {
        if (err) {
          done(err);
        }
        else {
          userDecisionModel.remove({ user: user._id }, function(err: any): void {
            done(err);
          });
        }
      });
  });

  it("Should display login form", function(done: Function): void {
    authServer.get("/v1/oauth2/login")
      .query(query)
      .expect(200)
      .end(done);
  });

  it("Should redirect to authorize form when log in", function(done: Function): void {

    const expectedRoute: string = "/v1/oauth2/authorize?" + querystring.stringify(query);
    authServer.post("/v1/oauth2/login")
      .query(query)
      .type("form")
      .send({ email: config.get<string>("test.user.email") })
      .send({ password: config.get<string>("test.user.password") })
      .redirects(0)
      .expect(302)
      .expect("set-cookie", /connect.sid=[A-Za-z0-9%;=/ .-]*/g)
      .expect("Location", expectedRoute)
      .end(done);
  });

  it("Should display authorization form", function(done: Function): void {

    authServer.get("/v1/oauth2/authorize")
      .query(query)
      .expect(200)
      .end(function(err: any, res: any): void {
        let $: any = cheerio.load(res.text);
        transacId = $("input[name=transaction_id]").attr("value");
        done(err);
      });
  });

  it("Should redirect to redirectUri with code when validating authorization", function(done: Function): void {

    authServer.post("/v1/oauth2/authorize")
      .query(query)
      .redirects(0)
      .type("form")
      .send({ allow: "" })
      .send({ transaction_id: transacId })
      .expect(302)
      .expect("Location",
      new RegExp(`${config.get<[string]>("test.client.redirectUri")[0].replace(/[.]/g, "[.]")}\/[?]code=[A-Za-z0-9]*`))
      .end(function(err: any, res: any): void {
        code = res.header.location.split("=")[1];
        done(err);
      });
  });

  it("Should reply an access_token when exchanging code", function(done: Function): void {

    authServer.post("/v1/oauth2/token")
      .type("form")
      .send({ grant_type: "authorization_code" })
      .send({ redirect_uri: config.get<[string]>("test.client.redirectUri")[0] })
      .send({ code: code })
      .auth(config.get("test.client.id"), config.get("test.client.secret"))
      .expect(200)
      .end(function(err: any, res: any): void {
        const result: any = JSON.parse(res.text);
        if (!result.access_token || !result.refresh_token || !result.expire_in || !result.token_type) {
          done(new Error("Invalid reply"));
        }
        else {
          done(err);
        }
      });
  });
});
