"use strict";

import * as express from "express";
import * as passport from "passport";

import ModelManager from "../../../lib/model/ModelManager";
import { IUserDocument, IUserDocumentModel } from "../../../lib/model/User";

const localStrategy: any = require("passport-local").Strategy;

passport.use("login", new localStrategy({
  usernameField: "email",
  passwordFiled: "password"
},
  function(email: string, password: string, done: (err: any, user?: IUserDocument | boolean) => void): void {
    const userModel: IUserDocumentModel = ModelManager.getUserModel();
    userModel.findUserByEmail(email, function(err: any, user: IUserDocument): void {
      if (err) {
        done(err);
      }
      else if (!user) {
        done(undefined, false);
      }
      else {
        user.verifyPassword(password, function(err: any, result: boolean): void {
          if (err) {
            done(err);
          }
          else if (result) {
            done(undefined, user);
          }
          else {
            done(undefined, false);
          }
        });
      }
    });
  }
));

passport.serializeUser(function(user: IUserDocument, done: (err: any, userId: string) => void): void {
  done(undefined, user.publicId);
});

passport.deserializeUser(function(userPublicId: string, done: (err: any, user?: IUserDocument | boolean) => void): void {

  const userModel: IUserDocumentModel = ModelManager.getUserModel();
  userModel.findUserByPublicId(userPublicId, function(err: any, user: IUserDocument): void {
    if (err) {
      done(err);
    }
    else if (user === undefined) {
      done(undefined, false);
    }
    else {
      done(undefined, user);
    }
  });
});

function validateLogin(req: express.Request, res: express.Response, next: express.NextFunction,
  cb: (err: any, user: IUserDocument, info: any) => void): void {
  passport.authenticate("login", cb)(req, res, next);
}
export default validateLogin;
