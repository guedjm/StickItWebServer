"use strict";

const requiredir = require("require-dir");

describe("Testing authentication server", function () {

  describe("Testing routes", function () {

    requiredir("./route");
  });

  describe("Testing complete flow", function () {

    requiredir("./flow");
  });
});
