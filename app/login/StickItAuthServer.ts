'use strict';

import * as express from "express";
import { info } from "winston";

export class StickItAuthServer {

    private router: express.Router;

    initialize() {

        info('Initializing StickItAuthServer');
        this.router = express.Router();


    }

    get routes(): express.Router {
        return this.router;
    }
}