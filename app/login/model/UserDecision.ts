'use strict';

import * as mongoose from "mongoose";

import { IUserDocument } from "./User";
import {IClientDocument} from "./Client";

export interface IUserDecisionDocument extends mongoose.Document {

  user: IUserDocument | string;
  client: IClientDocument | string;
  allow: boolean;
  scope: [string];
  date: Date;
  expirationDate: Date;
  usable: boolean;
}

export interface IUserDecisionDocumentModel extends mongoose.Model<IUserDecisionDocument> {

  createUserDecision(userId: string, clientId: string, allow: boolean, scope: [string],
                     cb: (err: any, decision: IUserDecisionDocument)=> void): void;

  findUserDecision(userId: string, clientId: string, scope: [string],
                   cb: (err: any, decision: IUserDecisionDocument)=> void ): void;

  disableOldDecision(userId: string, clientId: string, cb: (err: any)=> void): void;
}

const userDecisionSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  client: {type: mongoose.Schema.Types.ObjectId, ref: 'client'},
  allow: Boolean,
  usable: Boolean,
  scope: [mongoose.Schema.Types.String],
  date: Date,
  expirationDate: Date
});

userDecisionSchema.static('createUserDecision', function (userId: string, clientId: string, allow: boolean, scope: [string],
  cb: (err: any, decision: IUserDecisionDocument)=> void): void {

  const now: Date = new Date();
  const expiration = now.getTime() + now.getTime() + 10 * 43200000; // 30 days

  UserDecisionModel.create({
    user: userId,
    client: clientId,
    allow: allow,
    usable: true,
    scope: scope,
    date: now,
    expirationDate: expiration
  }, cb);
});

userDecisionSchema.static('findUserDecision', function (userId: string, clientId: string, scope: [string],
                                                        cb: (err: any, decision: IUserDecisionDocument)=> void ): void {

  UserDecisionModel.findOne({user: userId, client: clientId, usable: true,
    expirationDate: {$gt: new Date()}, scope: { $all: scope}},
    cb);
});

userDecisionSchema.static('disableOldDecision', function (userId: string, clientId: string,
                                                          cb: (err: any)=> void): void {
  UserDecisionModel.update({user: userId, client: clientId, usable: true}, {usable: false}, {multi: true},
    function (err: any, rows: number, raw: [IUserDecisionDocument]): void {
    cb(err);
  });
});



export const UserDecisionModel :IUserDecisionDocumentModel =
  <IUserDecisionDocumentModel>mongoose.model('userDecision', userDecisionSchema);