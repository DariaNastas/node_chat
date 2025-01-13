/* eslint-disable no-console */
import 'dotenv/config';
import express from 'express';
import Cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

import { router as userRouter } from './routes/user.rout.js';
import { router as roomRouter } from './routes/room.rout.js';
import { router as messageRouter } from './routes/message.rout.js';

import { errorMiddleware } from './middleware/error.middleware.js';

const PORT = process.env.PORT || 3005;

export const emmiter = new EventEmitter();

const app = express();

app.use(
  Cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/', userRouter);
app.use('/', roomRouter);
app.use('/', messageRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  console.log('A new client connected');

  client.on('error', (err) => {
    console.error(`WebSocket client error: ${err}`);
  });

  client.on('message', (message) => {
    console.log(`Received message: ${message}`);
    emmiter.emit('message', { message });
  });

  client.on('close', () => {
    console.log('Client disconnected');
  });
});

emmiter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});

process.on('SIGINT', () => {
  wss.clients.forEach((client) => client.close());

  server.close(() => {
    console.log('Server shut down gracefully');
  });
});
