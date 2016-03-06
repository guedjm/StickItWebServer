'use strict';

import * as express from "express";
import { info } from "winston";

import * as ClientController from "./controller/Client";

export class StickItAuthServer {

    private router: express.Router;

    initialize() {

        info('Initializing StickItAuthServer');
        this.router = express.Router();

        this.router.post('/client', ClientController.createClient);
    }

    get routes(): express.Router {
        return this.router;
    }
}