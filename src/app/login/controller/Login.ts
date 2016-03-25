"use strict";

import * as express from "express";
import * as queryStr from "querystring";

import validateLogin from "../auth/LoginAuth";
import { IUserDocument } from "../../../lib/model/User";

export function loginForm(req: express.Request, res: express.Response): void {
  if (isLogged(req)) {
    res.redirect("/v1/oauth2/authorize?" + queryStr.stringify(req.query));
  }
  else {
    res.render("login.jade");
  }
}

export function validateLoginForm(req: express.Request, res: express.Response, next: express.NextFunction): void {
  validateLogin(req, res, next, function(err: any, user: IUserDocument, info: any): void {
    if (err) {
      next(err);
    }
    else if (!user) {
      res.redirect("/v1/oauth2/login?" + queryStr.stringify(req.query));
    }
    else {
      req.logIn(user, function(err: any): void {
        if (err) {
          next(err);
        }
        else {
          res.redirect("/v1/oauth2/authorize?" + queryStr.stringify(req.query));
        }
      });
    }
  });
}

export function authorizeForm(req: any, res: any): void {
  res.render("authorize.jade", {
    fName: req.user.firstName,
    lName: req.user.lastName,
    api: req.oauth2.client.name,
    transactionID: req.oauth2.transactionID
  });
}

export function isLogged(req: express.Request): boolean {
  return req.session["publicId"] !== undefined;
}

export function userLogged(req: express.Request, res: express.Response, next: express.NextFunction): any {
  if (!req.user) {
    res.redirect("/v1/oauth2/login?" + queryStr.stringify(req.query));
  }
  else {
    next();
  }
}
