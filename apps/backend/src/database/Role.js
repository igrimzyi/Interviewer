import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('interviewer', 'interviewee'),
      allowNull: false
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
  }
);

export default Role