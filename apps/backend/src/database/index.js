import { sequelize } from './db.js'

import Organization from './Organization.js';
import Role from './Role.js';
import User from './User.js';
import Question from './Question.js';
import TestCase from './TestCase.js';
import Session from './Session.js';

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Organization.hasMany(User, { foreignKey: 'organizationId', as: 'members' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Question, { foreignKey: 'organizationId', as: 'questions' });
Question.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

User.hasMany(Question, { foreignKey: 'createdById', as: 'createdQuestions' });
Question.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

Question.hasMany(TestCase, { foreignKey: 'questionId', as: 'testCases' });
TestCase.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

Question.hasMany(Session, { foreignKey: 'questionId', as: 'sessions' });
Session.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

User.hasMany(Session, { foreignKey: 'interviewerId', as: 'conductedSessions' });
Session.belongsTo(User, { foreignKey: 'interviewerId', as: 'interviewer' });

User.hasMany(Session, { foreignKey: 'intervieweeId', as: 'participatedSessions' });
Session.belongsTo(User, { foreignKey: 'intervieweeId', as: 'interviewee' });

Organization.hasMany(Session, { foreignKey: 'organizationId', as: 'sessions' });
Session.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

async function syncDatabase(options = {}) {
  await sequelize.sync(options);
  console.log('✅  Database synced');
}

export {
  sequelize,
  syncDatabase,
  Organization,
  Role,
  User,
  Question,
  TestCase,
  Session,
};
