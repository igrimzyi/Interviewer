import { Sequelize } from "sequelize";
import process from "process";
import dotenv from "dotenv";

dotenv.config({path:'../../../../.env'});

console.log(process.env.DB_NAME)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

export { sequelize }
