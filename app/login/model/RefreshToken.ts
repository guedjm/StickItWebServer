'use strict';

import { Utils } from "../misc/Utils";
import * as mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    grant: mongoose.Schema.Types.String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    client: {type: mongoose.Schema.Types.ObjectId, ref: 'client'},
    token: mongoose.Schema.Types.String,
    usable: Boolean,
    deliveryDate: Date,
    expirationDate: Date
});

refreshTokenSchema.static('createToken', function (grant: string, userId: string, clientId: string, cb: Function) {
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

refreshTokenSchema.static('getToken', function(token: string, cb: Function) {
    RefreshTokenModel.findOne({token: token}, cb)
});

refreshTokenSchema.method('condemn', function(cb: Function) {
    this.usable = false;
    this.save(cb);
});

export const RefreshTokenModel = mongoose.model('refreshToken', refreshTokenSchema);