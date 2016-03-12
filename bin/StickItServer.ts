'use strict';

import * as http from "http";
import * as express from "express";
import * as mongoose from "mongoose";
import * as vhost from "vhost";
import * as bodyParser from "body-parser";
import * as passport from "passport";
import * as session from "express-session";
import { info, error } from "winston";

import { StickItAuthServer } from "../app/login/StickItAuthServer";
import { StickItError } from "../misc/Error";


export class StickItServer {

  private exp:express.Express;
  private server:http.Server;
  private authApp:StickItAuthServer;

  initialize() {
    info('Initializing server');
    this._initializeExpress();
    this._initializeDatabaseConnection();
    this.server = http.createServer(this.exp);
  }

  start(port:number) {

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

    this.exp.set('views', './app/login/view');
    this.exp.set('view engine', 'jade');

    this.exp.use(express.static('./app/login/public'));
    this.exp.use(session({
      secret: "fzeoijfiozejfioejzio",
      resave: true,
      saveUninitialized: false
    }));
    this.exp.use(bodyParser.json());
    this.exp.use(bodyParser.urlencoded({extended: false}));
    this.exp.use(passport.initialize());
    this.exp.use(passport.session());

    //Initialize app
    this.authApp = new StickItAuthServer();
    this.authApp.initialize();
    this.exp.use(vhost("login.stickit.local", this.authApp.routes));

    this.exp.use(function (err:any, req:express.Request, res:express.Response, next:express.NextFunction) {

      if (!(err instanceof StickItError))
        console.error(err.stack);
        err = StickItError.internalServerError();

      const serr:StickItError = err;
      res.status(serr.httpStatus).send({
        errorCode: serr.errorCode,
        errorSubCode: serr.errorSubCode,
        message: serr.message
      });
    });
  }
}