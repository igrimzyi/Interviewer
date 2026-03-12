import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const TestCase = sequelize.define(
  'TestCase',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expectedOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'test_cases',
    timestamps: true,
  }
);

export default TestCase