const { sequelize } = require('../config/database')
const Project = require('./Project')
const Content = require('./Content')

const initializeModels = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    console.log('Database connected and models synced')
  } catch (error) {
    console.error('Database init failed:', error.message)
    throw error
  }
}

module.exports = { sequelize, Project, Content, initializeModels }