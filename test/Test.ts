"use strict";

import * as config from "config";
import * as supertest from "supertest";
// noinspection TsLint
import { expect } from "chai";
import StickItServer from "../bin/StickItServer";
import modelManager from "../app/login/model/ModelManager";
import { IUserDocumentModel, IUserDocument } from "../app/login/model/User";
import { IClientDocumentModel, IClientDocument } from "../app/login/model/Client";

const authServer: any = supertest(`http://${config.get("authServer.url")}:${config.get("server.port")}`);
const requiredir: any = require("require-dir");


before(function(done: Function): void {

  console.log("Preparing database ...");
  const server: StickItServer = new StickItServer();
  server.disableLog();
  server.initialize();


  const clientModel: IClientDocumentModel = modelManager.getClientModel();
  clientModel.deleteClientById(config.get<string>("test.client.id"), function(err: any): void {
    if (err) {
      done(err);
    }
    else {
      clientModel.create({
        id: config.get<string>("test.client.id"),
        secret: config.get<string>("test.client.secret"),
        type: 2,
        name: config.get<string>("test.client.name"),
        redirectUri: config.get<[string]>("test.client.redirectUri"),
        creationDate: new Date(),
        activated: true
      }, function(err: any, client: IClientDocument): void {

        if (err) {
          done(err);
        }
        else {
          const userModel: IUserDocumentModel = modelManager.getUserModel();
          userModel.deleteByEmail(config.get<string>("test.user.email"), function(err: any): void {

            if (err) {
              done(err);
            }
            else {
              userModel.createUser(config.get<string>("test.user.email"),
                config.get<string>("test.user.password"),
                function(err: any, user: IUserDocument): void {
                  if (err) {
                    done(err);
                  }
                  else {

                    console.log("Done");
                    console.log("Starting server ...");

                    server.start();
                    console.log("Done");
                    done();
                  }
                });
            }
          });
        }
      });
    }
  });
});

describe("Testing StickItWeb server", function(): void {
  describe("App URL bindings", function(): void {

    it(`Auth server should reply to ${config.get("authServer.url")}:${config.get("server.port")}/ping route`,
      function(done: Function): void {

        authServer.get("/ping")
          .expect(200)
          .expect("Pong auth")
          .end(done);
      });
  });
  requiredir("../app/login/test");
});
