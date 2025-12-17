const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI service for generating/enhancing event descriptions using Google Gemini
class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.useAI = !!this.apiKey;
    if (this.useAI) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        // Use gemini-2.5-flash - latest fast model for text generation
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error.message);
        this.useAI = false;
      }
    } else {
      console.log('ℹ️  Gemini AI not configured (GEMINI_API_KEY missing)');
    }
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
      
      const fullPrompt = `You are a professional event planner helping to write engaging event descriptions. Keep descriptions concise (100-200 words), professional, and exciting.

${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const description = response.text();

      return {
        success: true,
        description: description.trim()
      };
    } catch (error) {
      console.error('AI generation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
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

      const fullPrompt = `You are a professional copywriter specializing in event marketing. Improve event descriptions to be more engaging while maintaining accuracy.

${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const description = response.text();

      return {
        success: true,
        description: description.trim()
      };
    } catch (error) {
      console.error('AI enhancement error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
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
