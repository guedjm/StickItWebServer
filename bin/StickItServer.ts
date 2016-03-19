"use strict";

import * as http from "http";
import * as vHost from "vhost";
import * as config from "config";
import * as winston from "winston";
import * as express from "express";
import * as mongoose from "mongoose";
import * as passport from "passport";
import StickItError from "../misc/Error";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import StickItAuthServer from "../app/login/StickItAuthServer";


export default class StickItServer {

  private exp: express.Express;
  private server: http.Server;
  private authApp: StickItAuthServer;

  public initialize(): void {
    winston.info("Initializing server");
    this._initializeExpress();
    this._initializeDatabaseConnection();
    this.server = http.createServer(this.exp);
  }

  public start(): void {

    this.server.listen(config.get("server.port"));
    winston.info(`Server listening on port ${config.get("server.port")}`);
  }

  public disableLog(): void {
    winston.level = "error";
  }


  private _initializeDatabaseConnection(): void {
    winston.info("Initializing database connection");

    mongoose.connection.on("open", function(): void {
      winston.info("Database connection initialized");
    });

    mongoose.connection.on("error", function(): void {
      winston.error("Unable to connect to the database");
    });

    mongoose.connect(`mongodb://${config.get("dbConfig.host")}:${config.get("dbConfig.port")}/${config.get("dbConfig.dbName")}`);
  }

  private _initializeExpress(): void {
    winston.info("Initializing express");

    this.exp = express();

    this.exp.set("views", "./app/login/view");
    this.exp.set("view engine", "jade");

    this.exp.use(express.static("./app/login/public"));
    this.exp.use(session({
      saveUninitialized: false,
      resave: true,
      secret: config.get<string>("server.sessionSecret")
    }));
    this.exp.use(bodyParser.json());
    this.exp.use(bodyParser.urlencoded({ extended: false }));
    this.exp.use(passport.initialize());
    this.exp.use(passport.session());

    // Initialize app
    this.authApp = new StickItAuthServer();
    this.authApp.initialize();
    this.exp.use(vHost(config.get<string>("authServer.url"), this.authApp.routes));

    this.exp.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
      if (!(err instanceof StickItError))
        console.error(err.stack);
      err = StickItError.internalServerError();

      const sErr: StickItError = err;
      res.status(sErr.httpStatus).send({
        errorCode: sErr.errorCode,
        errorSubCode: sErr.errorSubCode,
        message: sErr.message
      });
    });
  }
}
