import express from "express";
import routes from "./routes";

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(routes);

  return app;
}
// Explain deep details of each syntax part in afile  from entry point to logic file by file (one file at a time and propogate intietutively somy mental model is clear).
// Alongside for each part of code cover these areas  such as  what & where ts does, dev flow,bulndling aspects and runtim behaviour.