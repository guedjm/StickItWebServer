'use strict';

import * as passport from "passport";
import { ModelManager } from "../model/ModelManager";
import { IClientDocument, IClientDocumentModel } from "../model/Client";


const BasicStrategy = require("passport-http").BasicStrategy;

passport.use('client-basic', new BasicStrategy((key: string, secret: string, done: Function): void => {

  const model: IClientDocumentModel = ModelManager.getClientModel();
  model.findByClientIdAndSecret(key, secret, (err: any, client: IClientDocument):void => {
    if (err) {
      done(err);
    }
    else if (client == undefined) {
      done(null, false);
    }
    else {
      done(null, client);
    }
  });
}));

export const isBasicAuth = passport.authenticate('client-basic', { session: false });
