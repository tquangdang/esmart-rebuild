const { sequelize } = require('../config/database')
const Project = require('./Project')
const Content = require('./Content')

const initializeModels = async () => {
  try {
    await sequelize.sync({ alter: true })
    console.log('Database models synced successfully')
  } catch (error) {
    console.error('Failed to sync models:', error.message)
  }
}

module.exports = { sequelize, Project, Content, initializeModels }