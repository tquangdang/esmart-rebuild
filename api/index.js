const express = require('express')
const cors = require('cors')
const { initializeModels } = require('../server/models')

const app = express()
app.use(cors())
app.use(express.json())

let modelsInitialized = false
app.use(async (req, res, next) => {
  if (!modelsInitialized) {
    await initializeModels()
    modelsInitialized = true
  }
  next()
})

app.use('/api/projects', require('../server/routes/project'))
app.use('/api/content', require('../server/routes/content'))
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

module.exports = app
