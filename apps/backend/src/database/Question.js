import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const Question = sequelize.define(
  'Question',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    constraints: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suggestedTimeLimitMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 5,
        max: 180,
      },
    },
    examples: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    starterCode: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
  },
  {
    tableName: 'questions',
    timestamps: true,
  }
);

export default Question;
