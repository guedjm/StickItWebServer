'use strict';

const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();

import * as queryStr from "querystring";
import * as config from "config";
import {ModelManager} from "../model/ModelManager";
import {IClientDocument, IClientDocumentModel} from "../model/Client";
import {IUserDocument, IUserDocumentModel} from "../model/User";
import {IAccessTokenDocument, IAccessTokenDocumentModel} from "../model/AccessToken";
import {IRefreshTokenDocument, IRefreshTokenDocumentModel} from "../model/RefreshToken";
import {Request, Response, NextFunction, RequestHandler} from "express";
import {IAuthCodeDocumentModel} from "../model/AuthCode";
import {IAuthCodeDocument} from "../model/AuthCode";
import {IUserDecisionDocumentModel} from "../model/UserDecision";
import {IUserDecisionDocument} from "../model/UserDecision";

server.serializeClient(function(client: IClientDocument, cb: (err: any, clientId: string)=> void): void {
  return cb(null, client.id);
});

server.deserializeClient(function(id: string, cb: (err: any, client: IClientDocument)=> void): void {
  const clientModel: IClientDocumentModel = ModelManager.getClientModel();
  clientModel.findByClientId(id,cb);
});

//Password grant
server.exchange(oauth2orize.exchange.password(
  function (client:IClientDocument, username:string, password: string, scope: [string], done:Function):void {

    checkScope(scope, function (err: any, scope: [string]): void {
      console.log(scope);
      console.log(err);
      if (err) {
        done(err);
      }
      else {
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
                    accessTokenModel.createToken("password", user._id, client._id, scope,
                      function (err:any, accessToken:IAccessTokenDocument):void {
                        if (err) {
                          done(err);
                        }
                        else if (accessToken == undefined) {
                          done(null, false);
                        }
                        else {

                          const refreshTokenModel:IRefreshTokenDocumentModel = ModelManager.getRefreshTokenModel();
                          refreshTokenModel.createToken("password", user._id, client._id, scope,
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
      }
    });
  }));

//Code grant
server.grant(oauth2orize.grant.code(function(client: IClientDocument,
                                             redirectUri: string, user: IUserDocument, ares: any, cb: (err: any, code: string | boolean)=> void): void {

  checkScope(ares.scope, function (err: any, scope: [string]): void {
    if (err) {
      cb(err, false);
    }
    else {
      const codeModel: IAuthCodeDocumentModel = ModelManager.getAuthCodeModel();
      codeModel.createCode(user._id, client._id, redirectUri, scope, (err: any, code: IAuthCodeDocument): void  => {
        cb(err, code == undefined ? false : code.code);
      });
    }
  });
}));

server.exchange(oauth2orize.exchange.code(function (client: IClientDocument, code: string, redirectURI: string,
                                                    done: (err: any, token?: string | boolean, rToken?: string, option?: Object)=> void ): void {
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
          const refreshTokenModel: IRefreshTokenDocumentModel = ModelManager.getRefreshTokenModel();

          accessTokenModel.disableOldToken(client._id, authCode.user, function (err: any):void {
            if (err) {
              done(err);
            }
            else {
              refreshTokenModel.disableOldToken(client._id, authCode.user, function (err: any): void {
                if (err) {
                  done(err);
                }
                else {
                  accessTokenModel.createToken('authorization_code', authCode.user, authCode.client, authCode.scope,
                    function (err:any, aToken: IAccessTokenDocument): void {
                      if (err) {
                        done(err);
                      }
                      else if (aToken == undefined) {
                        done(null, false);
                      }
                      else {

                        refreshTokenModel.createToken('authorization_code', authCode.user, authCode.client, authCode.scope,
                        function (err: any, rToken: IRefreshTokenDocument): void {
                          done(null, aToken.token, rToken.token, {expire_in: 3600});
                        });
                      }
                    });
                }
              });
            }
          });
        }
      });
    }
  });
}));


//Refresh token grant
server.exchange(oauth2orize.exchange.refreshToken(function (client: IClientDocument, refreshToken: string, scope: [string],
                                                            done: (err: any, aToken?: string, rToken?: string, params?: Object)=> void): void {

  checkScope(scope, function (err: any, scope: [string]): void {
    if (err) {
      done(err);
    }
    else {

      const refreshTokenModel: IRefreshTokenDocumentModel = ModelManager.getRefreshTokenModel();
      refreshTokenModel.getToken(refreshToken, client._id, scope, function (err: any, rToken: IRefreshTokenDocument): void {
        if (err) {
          done(err);
        }
        else if (rToken == undefined) {
          done(null);
        }
        else {
          const accessTokenModel:IAccessTokenDocumentModel = ModelManager.getAccessTokenModel();
          accessTokenModel.disableOldToken(client._id, rToken.user, function (err:any):void {
            if (err) {
              done(err);
            }
            else {

              refreshTokenModel.disableOldToken(client._id, rToken.user, function (err:any):void {
                if (err) {
                  done(err);
                }
                else {

                  //Generate token
                  accessTokenModel.createToken('refresh_token', rToken.user, client._id, rToken.scope,
                    function (err:any, aToken:IAccessTokenDocument):void {
                      if (err) {
                        done(err);
                      }
                      else {

                        refreshTokenModel.createToken('refresh_token', rToken.user, client._id, rToken.scope,
                          function (err:any, newRToken:IRefreshTokenDocument):void {
                            if (err) {
                              done(err);
                            }
                            else {
                              done(null, aToken.token, newRToken.token, {expire_in: 3600});
                            }
                          });
                      }
                    });
                }
              });
            }
          });
        }
      });
    }
  });
}));

function checkScope(scope: [string], cb: (err: any, scopes?: [string])=> void): void {

  let valid: boolean = true;
  const availableScopes: [string] = config.get<[string]>("authServer.scopes");

  if (scope != undefined && scope.length > 0) {

    scope.forEach(function (elem: string): void {
      if (availableScopes.indexOf(elem) == -1) {
        valid = false;
      }
    });

  } else {
    scope = [ availableScopes[0] ];
  }
  cb(valid ? null : new oauth2orize.AuthorizationError('Invalid scope', 'invalid_scope'),
    scope);
}

function saveUserDecision(req: any, done: (err: any, param?: any)=> void) {

  checkScope(req.oauth2.req.scope, function (err: any, scope: [string]): void {
    if (err) {
      done(err);
    }
    else {
      const userDecision: IUserDecisionDocumentModel = ModelManager.getUserDecisionModel();

      userDecision.disableOldDecision(req.user._id, req.oauth2.client._id, function (err: any) {
        if (err) {
          done(err);
        }
        else {
          userDecision.createUserDecision(req.user._id, req.oauth2.client._id, req.body.allow != undefined, scope,
            function (err:any, decision: IUserDecisionDocument): void {
              if (err) {
                done(err);
              }
              else {
                done(null, {allow: req.body.allow != undefined, scope: scope});
              }
            });
        }
      });
    }
  });
}

export const authorizationEndPoint: RequestHandler[] = [
  server.authorization(function (clientId: string, redirectUri: string, scope: [string],
                                 done: (err: any, client?: IClientDocument | boolean, redirectURI?: string | boolean)=> void): void {

    checkScope(scope, function (err: any, scope: [string]): void {
      if (err) {
        done(err);
      }
      else {
        const clientModel:IClientDocumentModel = ModelManager.getClientModel();
        clientModel.findByClientId(clientId, function (err:any, client:IClientDocument):void {
          if (err) {
            done(err)
          }
          else if (client == undefined || client.redirectURI.indexOf(redirectUri) == -1) {
            done(null, false, false);
          }
          else {
            done(null, client, redirectUri);
          }
        });
      }
    });
  }, function (clientId: string, userId: string, scope: [string], done: (err: any, result?: boolean, info?: any)=> void): void {

    checkScope(scope, function (err: any, scope: [string]): void {
      if (err) {
        done(err);
      }
      else {
        const userDecisionModel: IUserDecisionDocumentModel = ModelManager.getUserDecisionModel();
        userDecisionModel.findUserDecision(userId, clientId, scope, function (err: any, decision: IUserDecisionDocument): void {
          if (err) {
            done(err);
          }
          else {
            done(null, (decision != undefined) ? decision.allow : false, {scope: scope});
          }
        });
      }
    });
  }), server.errorHandler()];

export const sserver = server;
export const decisionEndPoint: RequestHandler[] = [server.decision({}, saveUserDecision), server.errorHandler()];
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