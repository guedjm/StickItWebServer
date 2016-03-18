'use strict';

import * as passport from "passport"
import { RequestHandler } from "express";

import ModelManager from "../model/ModelManager";
import { IUserDocument, IUserDocumentModel } from "../model/User";

const LocalStrategy = require("passport-local").Strategy;

passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordFiled: 'password'},
  function (email: string, password: string, done: (err: any, user?: IUserDocument | boolean)=> void): void {

    const userModel = ModelManager.getUserModel();
    userModel.findUserByEmail(email, function (err: any, user: IUserDocument) {
      if (err) {
        done(err);
      }
      else if (user == undefined) {
        done(null, false);
      }
      else {
        user.verifyPassword(password, function (err: any, result: boolean): void {
          if (result) {
            done(null, user);
          }
          else {
            done(null, false);
          }
        });
      }
    });
  }
));

passport.serializeUser(function(user: IUserDocument, done: (err: any, userId: string)=> void): void {
  done(null, user.publicId);
});

passport.deserializeUser(function(userPublicId: string, done: (err: any, user?: IUserDocument | boolean)=> void): void {

  const userModel: IUserDocumentModel = ModelManager.getUserModel();
  userModel.findUserByPublicId(userPublicId, function (err: any, user: IUserDocument): void {
    if (err) {
      done(err);
    }
    else if (user == undefined) {
      done(null, false);
    }
    else {
      done(null, user);
    }
  });
});

const validateLogin: RequestHandler = passport.authenticate('login', {});
export default validateLogin;