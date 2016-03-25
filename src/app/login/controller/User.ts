"use strict";

import * as express from "express";

import ModelManager from "../model/ModelManager";
import StickItError from "../../../misc/Error";
import { IUserDocumentModel, IUserDocument } from "../model/User";

export function createUser(req: express.Request, res: express.Response, next: express.NextFunction): any {

  if (req.body.email === undefined || req.body.password === undefined) {
    next(StickItError.invalidRequestError());
  }
  else {
    const userModel: IUserDocumentModel = ModelManager.getUserModel();
    userModel.createUser(req.body.email, req.body.password, (err: any, user: IUserDocument): void => {
      if (err) {
        next(err);
      }
      else if (user === undefined) {
        next(StickItError.internalServerError());
      }
      else {
        res.status(200).json({
          public_id: user.publicId,
          email: user.email
        });
      }
    });
  }
}
