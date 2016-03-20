"use strict";

import * as mongoose from "mongoose";

import { Utils } from "../misc/Utils";

export interface IClientDocument extends mongoose.Document {
  id: string;
  type: number;
  name: string;
  secret: string;
  redirectURI: [string];
  creationDate: Date;
  activated: boolean;
}

export interface IClientDocumentModel extends mongoose.Model<IClientDocument> {

  createClient(name: string, type: number, cb: (err: any, client: IClientDocument) => void): void;
  findByClientId(id: string, cb: (err: any, client: IClientDocument) => void): void;
  findByClientIdAndSecret(id: string, secret: string, cb: (err: any, client: IClientDocument) => void): void;
  deleteClientById(clientId: string, cb: (err: any) => void): void;
}

const clientSchema: any = new mongoose.Schema({
  id: mongoose.Schema.Types.String,
  type: Number,
  name: mongoose.Schema.Types.String,
  secret: mongoose.Schema.Types.String,
  redirectURI: [mongoose.Schema.Types.String],
  creationDate: Date,
  activated: Boolean
});

clientSchema.static("createClient", function(name: string, type: number, cb: (err: any, client: IClientDocument) => void): void {

  clientDocumentModel.create({
    id: Utils.uidGen(25),
    type: type,
    name: name,
    secret: Utils.uidGen(40),
    creationDate: new Date(),
    activated: true
  }, cb);
});

clientSchema.static("findByClientId", function(clientId: string, cb: (err: any, client: IClientDocument) => void): void {
  clientDocumentModel.findOne({ id: clientId }, cb);
});

clientSchema.static("findByClientIdAndSecret", function(clientId: string, secret: string,
  cb: (err: any, client: IClientDocument) => void): void {
  clientDocumentModel.findOne({ id: clientId, secret: secret }, cb);
});

clientSchema.static("deleteClientById", function(clientId: string,
  cb: (err: any) => void): void {
  clientDocumentModel.findOneAndRemove({ id: clientId }, cb);
});

export const clientDocumentModel: IClientDocumentModel = <IClientDocumentModel>mongoose.model("client", clientSchema);
