'use strict';

import * as express from "express";

import ModelManager from "../model/ModelManager";
import StickItError from "../../../misc/Error";
import { IClientDocument, IClientDocumentModel } from "../model/Client";

export function createClient(req:express.Request, res:express.Response, next:express.NextFunction) {

  if (req.body.name == undefined || req.body.type == undefined) {
    next(StickItError.invalidRequestError());
  }
  else {
    const clientModel:IClientDocumentModel = ModelManager.getClientModel();

    clientModel.createClient(req.body.name, req.body.type,
      function (err:any, client:IClientDocument) {

        if (err || client == undefined) {
          next(StickItError.internalServerError());
        }
        else {
          res.status(200).send(JSON.stringify({
            client_id: client.id,
            type: client.type,
            name: client.name,
            secret: client.secret
          }, null, 2));
        }
      });
  }
}

export function hello(req:express.Request, res:express.Response, next:express.NextFunction) {
  res.send('Hello');
}