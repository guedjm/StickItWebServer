"use strict";

import express from "express";

export function ping(req: express.Request, req: express.Response, next: NextFunction): void {

  res.status(200).send("Pong auth");
}
