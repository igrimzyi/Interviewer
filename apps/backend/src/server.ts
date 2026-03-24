import { createApp } from "./app";
import { syncDatabase } from "./database/index.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createApp();

syncDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
    process.exit(1);
  });
