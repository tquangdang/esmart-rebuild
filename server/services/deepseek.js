const axios = require('axios')
require('dotenv').config()

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = process.env.OPENROUTER_API_KEY

async function generateContent(topic, keywords, tone, type) {
  const prompt = `You are a professional content writer. Create a ${type} about "${topic}".
Keywords to include: ${keywords}
Tone: ${tone}
Requirements:
- SEO-optimized with natural keyword placement
- Well-structured with headings and sections
- Engaging and informative
- Appropriate length for a ${type}
Write the content now:`

  const response = await axios.post(API_URL, {
    model: 'deepseek/deepseek-chat-v3-0324',
    messages: [{ role: 'user', content: prompt }],
  }, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  return response.data.choices[0].message.content
}

module.exports = { generateContent }