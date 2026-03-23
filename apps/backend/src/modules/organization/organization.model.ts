import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../database/sequelize";

type OrganizationAttributes = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type OrganizationCreationAttributes = Optional<
  OrganizationAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  declare id: number;
  declare name: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organizations",
  },
);