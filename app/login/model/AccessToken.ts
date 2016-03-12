'use strict';

import * as mongoose from "mongoose";
import { Utils } from "../misc/Utils";
import {IUserDocument} from "./User";
import {IClientDocument} from "./Client";

export interface IAccessTokenDocument extends mongoose.Document {
  grant: string,
  user: string | IUserDocument;
  client: string | IClientDocument;
  token: string;
  usable: boolean;
  deliveryDate: Date;
  expirationDate: Date;

  condemn(cb:(err:any)=> void): void;
}

export interface IAccessTokenDocumentModel extends mongoose.Model<IAccessTokenDocument> {

  createToken(grant:string, userId:string| IUserDocument, clientId:string | IClientDocument, cb:(err:any, token:IAccessTokenDocument)=> void): void;
  getToken(token:string, cb:(err:any, token:IAccessTokenDocument)=> void): void;
}

const accessTokenSchema = new mongoose.Schema({
  grant: mongoose.Schema.Types.String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  client: {type: mongoose.Schema.Types.ObjectId, ref: 'client'},
  token: mongoose.Schema.Types.String,
  usable: Boolean,
  deliveryDate: Date,
  expirationDate: Date
});

accessTokenSchema.static('createToken', function (grant:string, userId:string | IUserDocument, clientId:string | IClientDocument,
                                                  cb:(err:any, token:IAccessTokenDocument)=> void) {
  const now = new Date();
  const expirationDate = now.getTime() + 60 * 60000; // 60 minutes

  AccessTokenModel.create({
    grant: grant,
    user: userId,
    client: clientId,
    token: Utils.uidGen(15),
    usable: true,
    deliveryDate: now,
    expirationDate: expirationDate
  }, cb);
});

accessTokenSchema.static('getToken', function (token:string,
                                               cb:(err:any, token:IAccessTokenDocument)=> void) {
  AccessTokenModel.findOne({token: token, usable: true, expirationDate: {$gt: new Date()}}, cb);
});

accessTokenSchema.method('condemn', function (cb:(err:any)=> void) {
  this.usable = false;
  this.save(cb);
});


export const AccessTokenModel:IAccessTokenDocumentModel = <IAccessTokenDocumentModel>mongoose.model('accessToken', accessTokenSchema);