// @ts-ignore
import http from 'http';
import { createApp } from "./app";
import { syncDatabase } from "./database/index.js";
import { attachEditorWS } from "./modules/editor/editor.ws.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createApp();
const server = http.createServer(app);

attachEditorWS(server);

syncDatabase()
  .then(() => {
      server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
    process.exit(1);
  });
