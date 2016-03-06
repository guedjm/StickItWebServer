'use strict';

import * as mongoose from "mongoose";
import { Utils } from "../misc/Utils";

const accessTokenSchema = new mongoose.Schema({
    grant: mongoose.Schema.Types.String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    client: {type: mongoose.Schema.Types.ObjectId, ref: 'client'},
    token:  mongoose.Schema.Types.String,
    usable: Boolean,
    deliveryDate: Date,
    expirationDate: Date
});

accessTokenSchema.static('createToken', function (grant: string, userId: string, clientId: string, cb: Function) {
    const now = new Date();
    const expirationDate = now.getTime() +  60 * 60000; // 60 minutes

    accessTokenModel.create({
        grant: grant,
        user: userId,
        client: clientId,
        token: Utils.uidGen(15),
        usable: true,
        deliveryDate: now,
        expirationDate: expirationDate
    }, cb);
});

accessTokenSchema.static('getToken', function (token: string, cb: Function) {
    accessTokenModel.findOne({token: token, usable: true, expirationDate : {$gt: new Date()}}, cb);
});

accessTokenSchema.method('condemn', function (cb: Function) {
    this.usable = false;
    this.save(cb);
});


export const accessTokenModel = mongoose.model('accessToken', accessTokenSchema);