'use strict';

import { IClientDocumentModel, ClientDocumentModel} from "./Client";
import { IUserDocumentModel, UserDocumentModel} from "./User";
import { IAccessTokenDocumentModel, AccessTokenModel} from "./AccessToken";
import { IRefreshTokenDocumentModel, RefreshTokenModel} from "./RefreshToken";

export class ModelManager {

  static getClientModel():IClientDocumentModel {
    return <IClientDocumentModel>ClientDocumentModel;
  }

  static getUserModel():IUserDocumentModel {
    return <IUserDocumentModel>UserDocumentModel;
  }

  static getAccessTokenModel():IAccessTokenDocumentModel {
    return <IAccessTokenDocumentModel>AccessTokenModel;
  }

  static getRefreshTokenModel():IRefreshTokenDocumentModel {
    return <IRefreshTokenDocumentModel>RefreshTokenModel;
  }
}
