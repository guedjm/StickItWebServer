import {IUserDocument} from "./User";
'use strict';

import { Utils } from "../misc/Utils";
import * as mongoose from "mongoose";
import {IClientDocument} from "./Client";


export interface IRefreshTokenDocument extends mongoose.Document {
  grant: string;
  user: string | IUserDocument;
  client: string | IClientDocument;
  token: string;
  usable: boolean;
  deliveryDate: Date;
  expirationDate: Date;

  condemn(cb:(err:any)=> void): void;
}

export interface IRefreshTokenDocumentModel extends mongoose.Model<IRefreshTokenDocument> {

  createToken(grant:string, userId:string | IUserDocument, clientId:string | IClientDocument, cb:(err:any, token:IRefreshTokenDocument)=> void): void;
  getToken(token:string, clientId: string, cb:(err:any, token:IRefreshTokenDocument)=> void): void;
  disableOldToken(clientId: string, userId: string | IUserDocument, cb: (err: any)=> void): void;
}

const refreshTokenSchema = new mongoose.Schema({
  grant: mongoose.Schema.Types.String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  client: {type: mongoose.Schema.Types.ObjectId, ref: 'client'},
  token: mongoose.Schema.Types.String,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

refreshTokenSchema.static('createToken', function (grant:string, userId:string, clientId:string, cb:(err:any, token:IRefreshTokenDocument)=> void) {
  const now = new Date();
  const expirationDate = now.getTime() + 60 * 72 * 60000;

  RefreshTokenModel.create({
    grant: grant,
    user: userId,
    client: clientId,
    token: Utils.uidGen(20),
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

refreshTokenSchema.static('getToken', function (token:string, clientId: string, cb:(err:any, token:IRefreshTokenDocument)=> void) {
  RefreshTokenModel.findOne({token: token, client: clientId, usable: true}, cb)
});

refreshTokenSchema.static('disableOldToken', function (clientId: string, userId: string, cb: (err: any)=> void): void {

  RefreshTokenModel.update({client: clientId, user: userId, usable: true}, {usable: false}, {multi: true},
    function (err: any) {
      cb(err);
    });
});


refreshTokenSchema.method('condemn', function (cb:(err:any)=> void) {
  this.usable = false;
  this.save(cb);
});

export const RefreshTokenModel:IRefreshTokenDocumentModel = <IRefreshTokenDocumentModel>mongoose.model('refreshToken', refreshTokenSchema);