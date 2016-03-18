'use strict';

import * as express from "express";
import { info } from "winston";

import isBasicAuth from "./auth/BasicAuth";
import validateLogin from "./auth/LoginAuth";
import * as ClientController from "./controller/Client";
import * as UserController from "./controller/User";
import * as OAuth2Controller from "./controller/OAuth2"
import * as LoginController from "./controller/Login";

export default class StickItAuthServer {

  private router:express.Router;

  initialize() {

    info('Initializing StickItAuthServer');
    this.router = express.Router();

    this.router.post('/client', ClientController.createClient);
    this.router.get('/client', isBasicAuth, ClientController.hello);

    this.router.post('/user', isBasicAuth, UserController.createUser);

    this.router.get('/login', LoginController.loginForm);
    this.router.post('/login', validateLogin, LoginController.onUserLogin);

    this.router.get('/authorize', OAuth2Controller.userLogged, ...OAuth2Controller.authorizationEndPoint,
      LoginController.authorizeForm, OAuth2Controller.sserver.errorHandler);
    this.router.post('/authorize', OAuth2Controller.userLogged, ...OAuth2Controller.decisionEndPoint);

    this.router.post('/token', isBasicAuth, ...OAuth2Controller.tokenEndPoint);
  }

  get routes():express.Router {
    return this.router;
  }
}