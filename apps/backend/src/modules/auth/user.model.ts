import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../database/sequelize";

export type UserRole = "interviewer" | "interviewee";

type UserAttributes = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId: number | null;
  organizationName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "organizationId" | "organizationName" | "createdAt" | "updatedAt"
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare organizationId: number | null;
  declare organizationName: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("interviewer", "interviewee"),
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "organizations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    organizationName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  },
);