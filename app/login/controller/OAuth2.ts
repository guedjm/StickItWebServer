import {unuse} from "passport";
'use strict';

const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();

import * as queryStr from "querystring";
import {ModelManager} from "../model/ModelManager";
import {IClientDocument, IClientDocumentModel} from "../model/Client";
import {IUserDocument, IUserDocumentModel} from "../model/User";
import {IAccessTokenDocument, IAccessTokenDocumentModel} from "../model/AccessToken";
import {IRefreshTokenDocument, IRefreshTokenDocumentModel} from "../model/RefreshToken";
import {Request, Response, NextFunction, RequestHandler} from "express";
import {IAuthCodeDocumentModel} from "../model/AuthCode";
import {IAuthCodeDocument} from "../model/AuthCode";

server.serializeClient(function(client: IClientDocument, cb: (err: any, clientId: string)=> void): void {
  return cb(null, client.id);
});

server.deserializeClient(function(id: string, cb: (err: any, client: IClientDocument)=> void): void {
  const clientModel: IClientDocumentModel = ModelManager.getClientModel();
  clientModel.findByClientId(id,cb);
});

//Password grant
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

//Code grant
server.grant(oauth2orize.grant.code(function(client: IClientDocument,
                                             redirectUri: string, user: IUserDocument, ares: any, cb: (err: any, code: string | boolean)=> void): void {

  const codeModel: IAuthCodeDocumentModel = ModelManager.getAuthCodeModel();
  codeModel.createCode(user._id, client._id, redirectUri, (err: any, code: IAuthCodeDocument): void  => {
    cb(err, code == undefined ? false : code.code);
  });
}));

server.exchange(oauth2orize.exchange.code(function (client: IClientDocument, code: string, redirectURI: string,
                                                    done: (err: any, token?: string | boolean)=> void ): void {

  const codeModel: IAuthCodeDocumentModel = ModelManager.getAuthCodeModel();
  codeModel.getCode(code, client._id, function (err: any, authCode: IAuthCodeDocument) {
    if (err) {
      done(err);
    }
    else if (authCode == undefined) {
      done(null, false);
    }
    else {
      authCode.useCode(function (err: any) {
        if (err) {
          done(err);
        }
        else {
          const accessTokenModel: IAccessTokenDocumentModel = ModelManager.getAccessTokenModel();
          accessTokenModel.createToken('authorization_code', authCode.user, authCode.client,
            function (err:any, token: IAccessTokenDocument): void {
              if (err) {
                done(err);
              }
              else if (token == undefined) {
                done(null, false);
              }
              else {
                done(null, token.token);
              }
            });
        }
      });
    }
  });
}));



export const authorizationEndPoint: RequestHandler = server.authorization(function (clientId: string, redirectUri: string,
                                                                                      done: (err: any, client?: IClientDocument | boolean, redirectURI?: string | boolean)=> void): void {
  const clientModel: IClientDocumentModel = ModelManager.getClientModel();
  clientModel.findByClientId(clientId, function (err: any, client: IClientDocument): void {
    if (err) {
      done(err)
    }
    else if (client == undefined) {
      done(null, false, false);
    }
    else {
      done(null, client, redirectUri);
    }
  });
});

export const sserver = server;
export const decisionEndPoint: RequestHandler[] = [server.decision(), server.errorHandler()];
export const tokenEndPoint:RequestHandler[] = [server.token(), server.errorHandler()];

export function isLogged(req: Request): boolean {
  return req.session['publicId'] != undefined;
}

export function userLogged(req: Request, res: Response, next: NextFunction) {
  if (req.user == undefined) {
    res.redirect('/login?' + queryStr.stringify(req.query));
  }
  else {
    next();
  }
}