'use strict';

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Utils } from "../misc/Utils";

const userSchema = new mongoose.Schema({
    publicId: mongoose.Schema.Types.String,
    email: mongoose.Schema.Types.String,
    password: mongoose.Schema.Types.String,
    registrationDate: Date
});


userSchema.static('createUser', function (email: string, password: string, cb: Function) {
    const salt = bcrypt.genSaltSync(6);

    UserModel.create({
        publicId: Utils.uidGen(20),
        email: email,
        password: bcrypt.hashSync(password, salt),
        registrationDate: new Date()
    }, cb);
});

userSchema.static('findUserByEmailAndPassword', function (email: string, password: string, cb: Function) {

    UserModel.findOne({email: email, password: password}, cb);
});


export const UserModel =  mongoose.model('user', userSchema);