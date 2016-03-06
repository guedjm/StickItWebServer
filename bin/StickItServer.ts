'use strict';

import * as http from "http";
import * as express from "express";
import * as mongoose from "mongoose";
import { info, error } from "winston";


export class StickItServer {

    private exp: express.Express;
    private server: http.Server;

    initialize() {
        info('Initializing server');
        this._initializeExpress();
        this._initializeDatabaseConnection();
        this.server = http.createServer(this.exp);
    }

    start(port: number) {

        this.server.listen(port);
        info('Server listening on port ' + port);
    }


    private _initializeDatabaseConnection() {
        info('Initializing database connection');

        mongoose.connection.on('open', function () {
           info('Database connection initialized');
        });

        mongoose.connection.on('error', function () {
            error('Unable to conenct to the database');
        });

        mongoose.connect('mongodb://localhost:27017/stockit');
    }

    private _initializeExpress() {
        info('Initializing express');

        this.exp = express();

        //Initialize app
    }
}