'use strict';

import * as express from "express";
import { info } from "winston";

import { isBasicAuth } from "./auth/BasicAuth";
import * as ClientController from "./controller/Client";

export class StickItAuthServer {

  private router:express.Router;

  initialize() {

    info('Initializing StickItAuthServer');
    this.router = express.Router();

    this.router.post('/client', ClientController.createClient);
    this.router.get('/client', isBasicAuth, ClientController.hello);
  }

  get routes():express.Router {
    return this.router;
  }
}