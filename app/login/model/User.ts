'use strict';

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";

import { Utils } from "../misc/Utils";

export interface IUserDocument extends mongoose.Document {
  publicId: string,
  email: string,
  password: string,
  registrationDate: Date

  verifyPassword(password:string, cb: (err: any, result: boolean)=> void): void;
}

export interface IUserDocumentModel extends mongoose.Model<IUserDocument> {

  createUser(email:string, password:string, cb:(err:any, user:IUserDocument)=> void): void;
  findUserByEmail(email:string, cb:(err:any, user:IUserDocument)=> void): void;
  findUserByPublicId(publicId: string, cb: (err: any, user: IUserDocument)=> void): void;
}

const userSchema = new mongoose.Schema({
  publicId: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  password: mongoose.Schema.Types.String,
  registrationDate: Date
});


userSchema.static('createUser', function (email:string, password:string,
                                          cb:(err:any, user:IUserDocument)=> void) {
  const salt = bcrypt.genSaltSync(6);

  UserDocumentModel.create({
    publicId: Utils.uidGen(20),
    email: email,
    password: bcrypt.hashSync(password, salt),
    registrationDate: new Date()
  }, cb);
});

userSchema.static('findUserByEmail', function (email:string, cb:(err:any, user:IUserDocument)=> void) {
  UserDocumentModel.findOne({email: email}, cb);
});

userSchema.static('findUserByPublicId', function (publicId: string, cb: (err: any, user: IUserDocument)=> void): void {
  UserDocumentModel.findOne({publicId: publicId}, cb);
});

userSchema.method('verifyPassword', function (password: string,  cb: (err: any, result: boolean)=> void): void {
  bcrypt.compare(password, this.password, cb);
});

export const UserDocumentModel:IUserDocumentModel = <IUserDocumentModel>mongoose.model('user', userSchema);