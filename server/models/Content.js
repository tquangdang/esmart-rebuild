const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')
const Project = require('./Project')

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'projects', key: 'id' },
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keywords: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  generatedContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'contents',
  timestamps: true,
})

Content.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' })
Project.hasMany(Content, { foreignKey: 'projectId' })

module.exports = Content