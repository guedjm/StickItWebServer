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

    condemn(cb: (err: any)=> void): void;
}

export interface IRefreshTokenModel extends mongoose.Model<IRefreshTokenDocument> {

    createToken(grant: string, userId: string, clientId: string, cb: (err: any, token: IRefreshTokenDocument)=> void): void;
    getToken(token: string, cb: (err: any, token: IRefreshTokenDocument)=> void): void;
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

refreshTokenSchema.static('createToken', function (grant: string, userId: string, clientId: string, cb: (err: any, token: IRefreshTokenDocument)=> void) {
    const now = new Date();
    const expirationDate = now.getTime() + 72 * 60000;

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

refreshTokenSchema.static('getToken', function(token: string, cb: (err: any, token: IRefreshTokenDocument)=> void) {
    RefreshTokenModel.findOne({token: token}, cb)
});

refreshTokenSchema.method('condemn', function(cb: (err: any)=> void) {
    this.usable = false;
    this.save(cb);
});

export const RefreshTokenModel: IRefreshTokenModel = <IRefreshTokenModel>mongoose.model('refreshToken', refreshTokenSchema);