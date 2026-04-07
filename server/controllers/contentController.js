const { Content } = require('../models')
const { generateContent } = require('../services/deepseek')

const getProjectContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      where: { projectId: req.params.projectId },
      order: [['createdAt', 'DESC']],
    })
    res.json(contents)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getContentById = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id)
    if (!content) return res.status(404).json({ error: 'Content not found' })
    res.json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createContent = async (req, res) => {
  try {
    const { projectId, topic, keywords, tone, contentType, generatedContent } = req.body
    const content = await Content.create({
      projectId, topic, keywords, tone, contentType, generatedContent,
    })
    res.status(201).json(content)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id)
    if (!content) return res.status(404).json({ error: 'Content not found' })
    await content.destroy()
    res.json({ message: 'Content deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const generateAndCreateContent = async (req, res) => {
  try {
    const { projectId, topic, keywords, tone, contentType } = req.body

    const generatedContent = await generateContent(topic, keywords, tone, contentType)

    const content = await Content.create({
      projectId, topic, keywords, tone, contentType, generatedContent,
    })

    res.status(201).json(content)
  } catch (error) {
    console.error('Generation error:', error.message)
    res.status(500).json({ error: 'Failed to generate content' })
  }
}

module.exports = { getProjectContent, getContentById, createContent, deleteContent, generateAndCreateContent }
