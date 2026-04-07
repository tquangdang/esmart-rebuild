const express = require('express')
const router = express.Router()
const { getProjectContent, getContentById, createContent, deleteContent, generateAndCreateContent } = require('../controllers/contentController')

router.get('/project/:projectId', getProjectContent)
router.get('/:id', getContentById)
router.post('/', createContent)
router.post('/generate', generateAndCreateContent)
router.delete('/:id', deleteContent)


module.exports = router
