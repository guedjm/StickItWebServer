'use strict';

import { IClientDocumentModel, ClientDocumentModel} from "./Client";

export class ModelManager {

    static getClientModel(): IClientDocumentModel {
        return <IClientDocumentModel>ClientDocumentModel;
    }
}
