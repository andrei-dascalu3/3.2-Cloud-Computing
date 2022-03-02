const http = require('http');
const config = require('./config.json');
const apireq = require('./api-requests');

const server = http.createServer(apireq.handler);
server.listen(config.port);
