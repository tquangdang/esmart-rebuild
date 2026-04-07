const { Project, Content } = require('../models')

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
      include: { model: Content, attributes: ['id'] },
    })
    const result = projects.map((p) => ({
      ...p.toJSON(),
      contentCount: p.Contents ? p.Contents.length : 0,
      Contents: undefined,
    }))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: Content,
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const createProject = async (req, res) => {
  try {
    const { title, description, type } = req.body
    const project = await Project.create({ title, description, type })
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    await Content.destroy({ where: { projectId: project.id } })
    await project.destroy()
    res.json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getAllProjects, getProjectById, createProject, deleteProject }
