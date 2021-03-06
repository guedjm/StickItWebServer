"use strict";

import * as passport from "passport";
import { RequestHandler } from "express";
import ModelManager from "../../../lib/model/ModelManager";
import { IClientDocument, IClientDocumentModel } from "../../../lib/model/Client";


const basicStrategy: any = require("passport-http").BasicStrategy;
const clientPasswordStrategy: any = require("passport-oauth2-client-password").Strategy;

passport.use("client-basic", new basicStrategy((key: string, secret: string, done: Function): void => {

  const model: IClientDocumentModel = ModelManager.getClientModel();
  model.findByClientIdAndSecret(key, secret, (err: any, client: IClientDocument): void => {
    if (err) {
      done(err);
    }
    else if (!client) {
      done(undefined, false);
    }
    else {
      done(undefined, client);
    }
  });
}));

passport.use("client-password", new clientPasswordStrategy((clientId: string, clientSecret: string, done: Function): void => {

  const model: IClientDocumentModel = ModelManager.getClientModel();
  model.findByClientIdAndSecret(clientId, clientSecret, (err: any, client: IClientDocument): void => {
    if (err) {
      done(err);
    }
    else if (!client) {
      done(undefined, false);
    }
    else {
      done(undefined, client);
    }
  });
}));

const isBasicAuth: RequestHandler = passport.authenticate(["client-basic", "client-password"], { session: false });
export default isBasicAuth;
