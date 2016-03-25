"use strict";

import * as express from "express";
import { info } from "winston";

import isBasicAuth from "./auth/BasicAuth";
import * as PingController from "./controller/Ping";
import * as OAuth2Controller from "./controller/OAuth2";
import * as LoginController from "./controller/Login";

export default class StickItAuthServer {

  private router: express.Router;

  public initialize(): void {

    info("Initializing StickItAuthServer");
    this.router = express.Router();

    this.router.get("/ping", PingController.ping);

    this.router.get("/v1/oauth2/login", LoginController.loginForm);
    this.router.post("/v1/oauth2/login", LoginController.validateLoginForm);

    this.router.get("/v1/oauth2/authorize", LoginController.userLogged, ...OAuth2Controller.authorizationEndPoint,
      LoginController.authorizeForm, OAuth2Controller.sserver.errorHandler);
    this.router.post("/v1/oauth2/authorize", LoginController.userLogged, ...OAuth2Controller.decisionEndPoint);

    this.router.post("/v1/oauth2/token", isBasicAuth, ...OAuth2Controller.tokenEndPoint);
  }

  get routes(): express.Router {
    return this.router;
  }
}
