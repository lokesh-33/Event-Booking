const axios = require('axios');

// AI service for generating/enhancing event descriptions
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.useAI = !!this.apiKey;
  }

  async generateEventDescription(eventData) {
    if (!this.useAI) {
      return {
        success: false,
        message: 'AI service not configured'
      };
    }

    try {
      const prompt = this.buildPrompt(eventData);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional event planner helping to write engaging event descriptions. Keep descriptions concise (100-200 words), professional, and exciting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        description: response.data.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('AI generation error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to generate description',
        error: error.message
      };
    }
  }

  async enhanceEventDescription(currentDescription, eventData) {
    if (!this.useAI) {
      return {
        success: false,
        message: 'AI service not configured'
      };
    }

    try {
      const prompt = `Enhance and improve this event description while keeping the key information:

Current Description: "${currentDescription}"

Event Details:
- Title: ${eventData.title}
- Location: ${eventData.location}
- Date: ${eventData.date}

Make it more engaging, professional, and appealing to potential attendees. Keep it around 150-200 words.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional copywriter specializing in event marketing. Improve event descriptions to be more engaging while maintaining accuracy.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 350,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        description: response.data.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('AI enhancement error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Failed to enhance description',
        error: error.message
      };
    }
  }

  buildPrompt(eventData) {
    return `Generate an engaging and professional event description for:

Event Title: ${eventData.title}
Location: ${eventData.location}
Date: ${eventData.date}
Time: ${eventData.time || 'TBD'}
Capacity: ${eventData.capacity} people
${eventData.category ? `Category: ${eventData.category}` : ''}

Write a compelling description that:
1. Explains what attendees can expect
2. Highlights the benefits of attending
3. Creates excitement and urgency
4. Is around 150-200 words

Do not include any formatting like bullet points or headers. Write in a flowing, engaging style.`;
  }
}

module.exports = new AIService();
