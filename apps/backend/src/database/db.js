import { Sequelize } from "sequelize";
import process from "process";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../../.env") });

const dialect = process.env.DB_DIALECT ?? 'mysql';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port,
    dialect,
    logging: false,
  }
);

export { sequelize }
