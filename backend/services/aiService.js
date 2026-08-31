const OpenAI = require('openai');
const ChatHistory = require('../models/ChatHistory');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getNutritionAdvice(userQuery, userContext) {
    try {
      const prompt = `You are a professional nutrition assistant. 
      User Profile:
      - Age: ${userContext.age}
      - Gender: ${userContext.gender}
      - Weight: ${userContext.weight} kg
      - Height: ${userContext.height} cm
      - Diseases: ${userContext.diseases.join(', ')}
      - Daily Calorie Goal: ${userContext.dailyCalorieGoal} kcal
      
      User Query: ${userQuery}
      
      Provide personalized nutrition advice considering their health conditions, 
      dietary restrictions, and fitness goals. Include specific food recommendations, 
      portion sizes, and meal timing suggestions if relevant.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful nutrition assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm having trouble processing your request. Please try again later.";
    }
  }

  async getMealPlanRecommendation(userContext, mealType) {
    try {
      const prompt = `Create a healthy ${mealType} meal plan for a person with:
      - Age: ${userContext.age}
      - Gender: ${userContext.gender}
      - Weight: ${userContext.weight} kg
      - Height: ${userContext.height} cm
      - Diseases: ${userContext.diseases.join(', ')}
      - Daily Calorie Goal: ${userContext.dailyCalorieGoal} kcal
      
      Provide 3 meal options with detailed nutritional information including calories, 
      protein, carbs, and fat. Make sure to consider their health conditions.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional nutritionist." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return this.parseMealPlan(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Meal Plan Error:', error);
      return null;
    }
  }

  parseMealPlan(content) {
    // Parse the AI response into structured data
    const lines = content.split('\n');
    const mealOptions = [];
    let currentOption = null;

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        if (currentOption) mealOptions.push(currentOption);
        currentOption = { name: line.replace(/^\d+\./, '').trim(), details: [] };
      } else if (currentOption && line.trim()) {
        currentOption.details.push(line.trim());
      }
    }
    
    if (currentOption) mealOptions.push(currentOption);
    
    return {
      success: true,
      mealOptions: mealOptions.length > 0 ? mealOptions : [{ name: "Recommended Meal", details: [content] }],
    };
  }

  async saveChatHistory(userId, messages) {
    try {
      let chatHistory = await ChatHistory.findOne({ user: userId });
      
      if (!chatHistory) {
        chatHistory = new ChatHistory({ user: userId, messages: [] });
      }
      
      chatHistory.messages.push(...messages);
      chatHistory.updatedAt = Date.now();
      
      await chatHistory.save();
      return chatHistory;
    } catch (error) {
      console.error('Save Chat History Error:', error);
    }
  }

  async getChatHistory(userId) {
    try {
      const chatHistory = await ChatHistory.findOne({ user: userId });
      return chatHistory ? chatHistory.messages : [];
    } catch (error) {
      console.error('Get Chat History Error:', error);
      return [];
    }
  }
}

module.exports = new AIService();