"use strict";

const requiredir: any = require("require-dir");

describe("Testing authentication server", function(): void {

  describe("Testing routes", function(): void {
    requiredir("./route");
  });

  describe("Testing complete flow", function(): void {
    requiredir("./flow");
  });
});
