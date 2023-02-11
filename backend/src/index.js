require('dotenv').config();
const cors = require('cors');
const express = require('express');
const ws = require('ws');

const { dbMiddleware } = require('./middleware/database');
const { errorHandler } = require('./middleware/requestHandler');
const { verifyMiddleware } = require('./middleware/verifier');

const api = require('./api');

//enables CORS in dev server
var corsOptions = {
  origin: process.env.URL,
};

console.log(corsOptions.origin)

const port = process.env.PORT || 5000;

const app = express();

const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message.toString()));
});


app.use(express.json());
app.use(cors(corsOptions));
app.use(dbMiddleware);
app.use(errorHandler);
app.use(verifyMiddleware);

api.init(app, wsServer);

const server = app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
