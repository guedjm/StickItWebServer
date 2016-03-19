"use strict";

import * as mongoose from "mongoose";
import * as config from "config";

import {IUserDocument} from "./User";
import { Utils } from "../misc/Utils";
import {IClientDocument} from "./Client";


export interface IRefreshTokenDocument extends mongoose.Document {
  grant: string;
  user: string | IUserDocument;
  client: string | IClientDocument;
  token: string;
  scope: [string];
  usable: boolean;
  deliveryDate: Date;
  expirationDate: Date;

  condemn(cb: (err: any) => void): void;
}

export interface IRefreshTokenDocumentModel extends mongoose.Model<IRefreshTokenDocument> {

  createToken(grant: string, userId: string | IUserDocument, clientId: string | IClientDocument, scope: [string],
    cb: (err: any, token: IRefreshTokenDocument) => void): void;
  getToken(token: string, clientId: string, scope: [string], cb: (err: any, token: IRefreshTokenDocument) => void): void;
  disableOldToken(clientId: string, userId: string | IUserDocument, cb: (err: any) => void): void;
}

const refreshTokenSchema: any = new mongoose.Schema({
  grant: mongoose.Schema.Types.String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
  token: mongoose.Schema.Types.String,
  scope: [mongoose.Schema.Types.String],
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

refreshTokenSchema.static("createToken", function(grant: string, userId: string, clientId: string, scope: [string],
  cb: (err: any, token: IRefreshTokenDocument) => void): void {
  const now: Date = new Date();
  const expirationDate: number = now.getTime() + 60 * 60000 * config.get<number>("authServer.accessTokenDuration");

  refreshTokenModel.create({
    grant: grant,
    user: userId,
    client: clientId,
    token: Utils.uidGen(20),
    scope: scope,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

refreshTokenSchema.static("getToken", function(token: string, clientId: string, scope: [string],
  cb: (err: any, token: IRefreshTokenDocument) => void): void {
  refreshTokenModel.findOne({
    token: token, client: clientId, usable: true,
    expirationDate: { $gt: new Date() }, scope: { $all: scope }
  }, cb);
});

refreshTokenSchema.static("disableOldToken", function(clientId: string, userId: string, cb: (err: any) => void): void {

  refreshTokenModel.update({ client: clientId, user: userId, usable: true }, { usable: false }, { multi: true },
    function(err: any): void {
      cb(err);
    });
});


refreshTokenSchema.method("condemn", function(cb: (err: any) => void): void {
  this.usable = false;
  this.save(cb);
});

export const refreshTokenModel: IRefreshTokenDocumentModel = <IRefreshTokenDocumentModel>mongoose.model("refreshToken", refreshTokenSchema);
