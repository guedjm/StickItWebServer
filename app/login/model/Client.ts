'use strict';

import * as mongoose from "mongoose";
import { Utils } from "../misc/utils";

const clientSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.String,
    type: Number,
    name: mongoose.Schema.Types.String,
    secret: mongoose.Schema.Types.String,
    creationDate: Date,
    activated: Boolean
});

clientSchema.static('createClient', function (name: string, type: number, cb: Function) {

    ClientModel.create({
        id: Utils.uidGen(25),
        type: type,
        name: name,
        secret: Utils.uidGen(40),
        creationDate: new Date(),
        activated: true
    }, cb)
});

clientSchema.static('findById', function (clientId: string, cb: Function) {
    ClientModel.findOne({id: clientId}, cb);
});

clientSchema.static('findByIdAndSecret', function (clientId: string, secret: string, cb: Function) {
    ClientModel.findOne({id: clientId, secret: secret}, cb);
});

export const ClientModel = mongoose.model('client', clientSchema);