const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'finished'),
    defaultValue: 'in_progress',
  },
}, {
  tableName: 'projects',
  timestamps: true,
})

module.exports = Project