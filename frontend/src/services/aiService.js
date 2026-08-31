import api from './api';

export const aiService = {
  sendMessage: (message) => api.post('/ai/chat', { message }),
  getChatHistory: () => api.get('/ai/chat/history'),
  clearChatHistory: () => api.delete('/ai/chat/history'),
  generateMealPlan: (planType) => api.get(`/ai/mealplan?plan_type=${planType}`),
  recognizeFood: (imageBase64) => api.post('/ai/food-recognition', { image: imageBase64 }),
};

export default aiService;
