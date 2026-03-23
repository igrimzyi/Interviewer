import { createApp } from "./app";
import { config } from "./config";
import { initializeDatabase } from "./database/sequelize";
import "./database/models";

const app = createApp();

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void startServer();
