"use strict";

import * as express from "express";

export function ping(req: express.Request, res: express.Response, next: express.NextFunction): void {

  res.status(200).send("Pong auth");
}
