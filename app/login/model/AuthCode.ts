'use strict';

import * as mongoose from "mongoose";
import {IUserDocument} from "./User";
import {IClientDocument} from "./Client";
import {Utils} from "../misc/Utils";

export interface IAuthCodeDocument extends mongoose.Document {
  code: string;
  user: string | IUserDocument;
  client: string | IClientDocument;
  redirectUri: string;
  usable: boolean;
  deliveryDate: Date;
  expirationDate: Date;

  condemn(cb: (err: any)=> void): void;
}

export interface IAuthCodeDocumentModel extends mongoose.Model<IAuthCodeDocument> {

  createCode(userId: string, clientId: string, redirectUri: string, cb: (err:any, code: IAuthCodeDocument)=> void): void;
  getCode(code: string, clientId: string, cb: (err: any, code: IAuthCodeDocument)=> void) : void;
}

const authCodeSchema = new mongoose.Schema({
  code: mongoose.Schema.Types.String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'client'},
  redirectUri: mongoose.Schema.Types.String,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

authCodeSchema.static('createCode', function (userId: string, clientId: string, redirectUri: string,
                                              cb: (err:any, code: IAuthCodeDocument)=> void): void {

  const now = new Date();
  const expirationDate = now.getTime() + 10 * 60000;
  AuthCodeModel.create({
    code: Utils.uidGen(40),
    user: userId,
    client: clientId,
    redirectUri: redirectUri,
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

authCodeSchema.static('getCode', function (code: string, clientId: string,
                                           cb: (err: any, code: IAuthCodeDocument)=> void) : void {
  AuthCodeModel.findOne({code: code, client: clientId, usable: true, expirationDate: {$gt: new Date()}}, cb);
});

authCodeSchema.method('condemn', function (cb: (err: any)=> void): void {

  this.usable = false;
  this.save(cb);
});


export const AuthCodeModel: IAuthCodeDocumentModel = <IAuthCodeDocumentModel>mongoose.model('authCode', authCodeSchema);