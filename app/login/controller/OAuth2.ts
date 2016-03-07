'use strict';

const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();

import {ModelManager} from "../model/ModelManager";
import {IClientDocument} from "../model/Client";
import {IUserDocument, IUserDocumentModel} from "../model/User";
import {IAccessTokenDocument, IAccessTokenDocumentModel} from "../model/AccessToken";
import {IRefreshTokenDocument, IRefreshTokenDocumentModel} from "../model/RefreshToken";
import {RequestHandler} from "express";

server.exchange(oauth2orize.exchange.password(
  function (client:IClientDocument, username:string, password:string, scope:string, done:Function):void {

    const userModel:IUserDocumentModel = ModelManager.getUserModel();
    userModel.findUserByEmail(username,
      function (err:any, user:IUserDocument):void {
        if (err) {
          done(err);
        }
        else if (user == undefined) {
          done(null, false);
        }
        else {

          user.verifyPassword(password,
            function (err:any, match:boolean):void {
              if (err) {
                done(err);
              }
              else if (match == false) {
                done(null, false);
              }
              else {
                const accessTokenModel:IAccessTokenDocumentModel = ModelManager.getAccessTokenModel();
                accessTokenModel.createToken("password", user._id, client._id,
                  function (err:any, accessToken:IAccessTokenDocument):void {
                    if (err) {
                      done(err);
                    }
                    else if (accessToken == undefined) {
                      done(null, false);
                    }
                    else {

                      const refreshTokenModel:IRefreshTokenDocumentModel = ModelManager.getRefreshTokenModel();
                      refreshTokenModel.createToken("password", user._id, client._id,
                        function (err:any, refreshToken:IRefreshTokenDocument):void {
                          if (err) {
                            done(err);
                          }
                          else if (refreshToken == undefined) {
                            done(null, false);
                          }
                          else {

                            done(null, accessToken.token, refreshToken.token, {expires_in: accessToken.expirationDate});
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  }));

export const tokenEndPoint:RequestHandler[] = [server.token(), server.errorHandler()];