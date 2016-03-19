"use strict";

import * as express from "express";
import * as queryStr from "querystring";

import { isLogged } from "../controller/OAuth2";

export function loginForm(req: express.Request, res: express.Response): void {
  if (isLogged(req)) {
    res.redirect("/authorize?" + queryStr.stringify(req.query));
  }
  else {
    res.render("login.jade");
  }
}

export function authorizeForm(req: any, res: any): void {
  res.render("authorize.jade", {
    fName: req.user.firstName,
    lName: req.user.lastName,
    api: req.oauth2.client.name,
    transactionID: req.oauth2.transactionID
  });
}

export function onUserLogin(req: express.Request, res: express.Response): void {
  res.redirect("/authorize?" + queryStr.stringify(req.query));
}
