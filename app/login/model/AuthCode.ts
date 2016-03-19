"use strict";

import * as mongoose from "mongoose";

import {Utils} from "../misc/Utils";
import {IUserDocument} from "./User";
import {IClientDocument} from "./Client";

export interface IAuthCodeDocument extends mongoose.Document {
  code: string;
  user: string | IUserDocument;
  client: string | IClientDocument;
  redirectUri: string;
  scope: [string];
  usable: boolean;
  deliveryDate: Date;
  expirationDate: Date;
  useDate: Date;

  condemn(cb: (err: any) => void): void;
  useCode(cb: (err: any) => void): void;
}

export interface IAuthCodeDocumentModel extends mongoose.Model<IAuthCodeDocument> {

  createCode(userId: string, clientId: string, redirectUri: string, scope: [string],
    cb: (err: any, code: IAuthCodeDocument) => void): void;
  getCode(code: string, clientId: string, cb: (err: any, code: IAuthCodeDocument) => void): void;
}

const authCodeSchema: any = new mongoose.Schema({
  code: mongoose.Schema.Types.String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
  redirectUri: mongoose.Schema.Types.String,
  scope: [mongoose.Schema.Types.String],
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date,
  useDate: Date
});

authCodeSchema.static("createCode", function(userId: string, clientId: string, redirectUri: string, scope: [string],
  cb: (err: any, code: IAuthCodeDocument) => void): void {

  const now: Date = new Date();
  const expirationDate: number = now.getTime() + 10 * 60000;
  authCodeModel.create({
    code: Utils.uidGen(40),
    user: userId,
    client: clientId,
    redirectUri: redirectUri,
    scope: scope,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

authCodeSchema.static("getCode", function(code: string, clientId: string,
  cb: (err: any, code: IAuthCodeDocument) => void): void {
  authCodeModel.findOne({ code: code, client: clientId, usable: true, expirationDate: { $gt: new Date() } }, cb);
});

authCodeSchema.method("condemn", function(cb: (err: any) => void): void {

  this.usable = false;
  this.save(cb);
});

authCodeSchema.method("useCode", function(cb: (err: any) => void): void {
  this.usable = false;
  this.useDate = new Date();

  this.save(cb);
});

export const authCodeModel: IAuthCodeDocumentModel = <IAuthCodeDocumentModel>mongoose.model("authCode", authCodeSchema);
