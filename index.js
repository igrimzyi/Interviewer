const sequelize = require('../config/db');

const Organization = require('./Organization');
const Role         = require('./Role');
const User         = require('./User');
const Question     = require('./Question');
const TestCase     = require('./TestCase');
const Session      = require('./Session');

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

module.exports = {
  sequelize,
  syncDatabase,
  Organization,
  Role,
  User,
  Question,
  TestCase,
  Session,
};
