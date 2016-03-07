'use strict';

import { IClientDocumentModel, ClientDocumentModel} from "./Client";
import { IUserDocumentModel, UserDocumentModel} from "./User";
import { IAccessTokenModel, AccessTokenModel} from "./AccessToken";
import { IRefreshTokenModel, RefreshTokenModel} from "./RefreshToken";

export class ModelManager {

  static getClientModel():IClientDocumentModel {
    return <IClientDocumentModel>ClientDocumentModel;
  }

  static getUserModel():IUserDocumentModel {
    return <IUserDocumentModel>UserDocumentModel;
  }

  static getAccessTokenModel():IAccessTokenModel {
    return <IAccessTokenModel>AccessTokenModel;
  }

  static getRefreshTokenModel():IRefreshTokenModel {
    return <IRefreshTokenModel>RefreshTokenModel;
  }
}
