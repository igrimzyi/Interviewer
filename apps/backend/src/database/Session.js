import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';
import Role from './Role.js';

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sessionCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    interviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    intervieweeId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    selectedLanguage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'JavaScript',
    },
    currentCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'sessions',
    timestamps: true,
  }
);

export default Session