'use strict';

import * as express from "express";
import { info } from "winston";

import { isBasicAuth } from "./auth/BasicAuth";
import * as ClientController from "./controller/Client";
import * as UserController from "./controller/User";

export class StickItAuthServer {

  private router:express.Router;

  initialize() {

    info('Initializing StickItAuthServer');
    this.router = express.Router();

    this.router.post('/client', ClientController.createClient);
    this.router.get('/client', isBasicAuth, ClientController.hello);

    this.router.post('/user', isBasicAuth, UserController.createUser);
  }

  get routes():express.Router {
    return this.router;
  }
}