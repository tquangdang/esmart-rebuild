const express = require('express')
const cors = require('cors')

try { require('dotenv').config() } catch {}

const { initializeModels } = require('./models')
initializeModels()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const projectRoutes = require('./routes/project')
const contentRoutes = require('./routes/content')

app.use('/api/projects', projectRoutes)
app.use('/api/content', contentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'eSmart API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})