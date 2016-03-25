"use strict";

import { IClientDocumentModel, clientDocumentModel} from "./Client";
import { IUserDocumentModel, userDocumentModel} from "./User";
import { IAccessTokenDocumentModel, accessTokenModel} from "./AccessToken";
import { IRefreshTokenDocumentModel, refreshTokenModel} from "./RefreshToken";
import { IAuthCodeDocumentModel, authCodeModel} from "./AuthCode";
import { IUserDecisionDocumentModel, userDecisionModel} from "./UserDecision";

export default class ModelManager {

  public static getClientModel(): IClientDocumentModel {
    return <IClientDocumentModel>clientDocumentModel;
  }

  public static getUserModel(): IUserDocumentModel {
    return <IUserDocumentModel>userDocumentModel;
  }

  public static getAccessTokenModel(): IAccessTokenDocumentModel {
    return <IAccessTokenDocumentModel>accessTokenModel;
  }

  public static getRefreshTokenModel(): IRefreshTokenDocumentModel {
    return <IRefreshTokenDocumentModel>refreshTokenModel;
  }

  public static getAuthCodeModel(): IAuthCodeDocumentModel {
    return <IAuthCodeDocumentModel>authCodeModel;
  }

  public static getUserDecisionModel(): IUserDecisionDocumentModel {
    return <IUserDecisionDocumentModel>userDecisionModel;
  }
}
