"use strict";

import * as mongoose from "mongoose";
import * as config from "config";

import {Utils} from "../misc/Utils";
import {IUserDocument} from "./User";
import {IClientDocument} from "./Client";

export interface IAccessTokenDocument extends mongoose.Document {
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

export interface IAccessTokenDocumentModel extends mongoose.Model<IAccessTokenDocument> {

  createToken(grant: string, userId: string | IUserDocument, clientId: string | IClientDocument, scope: [string],
    cb: (err: any, token: IAccessTokenDocument) => void): void;
  getToken(token: string, cb: (err: any, token: IAccessTokenDocument) => void): void;
  disableOldToken(clientId: string, userId: string | IUserDocument, cb: (err: any) => void): void;
}

const accessTokenSchema: any = new mongoose.Schema({
  grant: mongoose.Schema.Types.String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
  token: mongoose.Schema.Types.String,
  scope: [mongoose.Schema.Types.String],
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

accessTokenSchema.static("createToken", function(grant: string, userId: string | IUserDocument,
  clientId: string | IClientDocument, scope: [string],
  cb: (err: any, token: IAccessTokenDocument) => void): void {
  const now: Date = new Date();
  const expirationDate: number = now.getTime() + 60 * config.get<number>("authServer.refreshTokenDuration");

  accessTokenModel.create({
    grant: grant,
    user: userId,
    client: clientId,
    token: Utils.uidGen(15),
    scope: scope,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

accessTokenSchema.static("getToken", function(token: string,
  cb: (err: any, token: IAccessTokenDocument) => void): void {
  accessTokenModel.findOne({ token: token, usable: true, expirationDate: { $gt: new Date() } }, cb);
});

accessTokenSchema.static("disableOldToken", function(clientId: string, userId: string, cb: (err: any) => void): void {

  accessTokenModel.update({ client: clientId, user: userId, usable: true }, { usable: false }, { multi: true },
    function(err: any): void {
      cb(err);
    });
});

accessTokenSchema.method("condemn", function(cb: (err: any) => void): void {
  this.usable = false;
  this.save(cb);
});


export const accessTokenModel: IAccessTokenDocumentModel = <IAccessTokenDocumentModel>mongoose.model("accessToken", accessTokenSchema);
