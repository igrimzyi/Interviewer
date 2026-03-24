import { Sequelize } from "sequelize";
import { config } from "../config";

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: "mysql",
    logging: config.db.logging ? console.log : false,
  },
);

export async function initializeDatabase(): Promise<void> {
  await sequelize.authenticate();
  // Keep schema aligned with model changes during development.
  await sequelize.sync({ alter: true });
}
