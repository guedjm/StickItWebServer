'use strict';
var StickItServer_1 = require("./StickItServer");
const server = new StickItServer_1.StickItServer();
server.initialize();
server.start(3000);
