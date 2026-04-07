const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

let modelsReady = false
let initPromise = null

function ensureModels() {
  if (modelsReady) return Promise.resolve()
  if (!initPromise) {
    const { initializeModels } = require('../server/models')
    initPromise = initializeModels()
      .then(() => { modelsReady = true })
      .catch((err) => {
        initPromise = null
        throw err
      })
  }
  return initPromise
}

app.use(async (req, res, next) => {
  try {
    await ensureModels()
    next()
  } catch (err) {
    console.error('Model init failed:', err)
    res.status(500).json({ error: 'Database initialization failed' })
  }
})

app.use('/api/projects', require('../server/routes/project'))
app.use('/api/content', require('../server/routes/content'))
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

module.exports = app
