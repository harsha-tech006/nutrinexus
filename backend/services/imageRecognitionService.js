const vision = require('@google-cloud/vision');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const sharp = require('sharp');

class ImageRecognitionService {
  constructor() {
    // Initialize Google Vision client if API key is available
    if (process.env.GOOGLE_VISION_API_KEY) {
      this.visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }
  }

  async analyzeFoodImage(imageBuffer) {
    try {
      // First, try Google Vision if available
      if (this.visionClient) {
        return await this.analyzeWithGoogleVision(imageBuffer);
      }
      
      // Fallback to OCR with Tesseract
      return await this.analyzeWithOCR(imageBuffer);
    } catch (error) {
      console.error('Image Recognition Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  async analyzeWithGoogleVision(imageBuffer) {
    try {
      const [result] = await this.visionClient.labelDetection(imageBuffer);
      const labels = result.labelAnnotations;
      
      // Extract food-related labels
      const foodLabels = labels.filter(label => 
        label.description.toLowerCase().includes('food') ||
        label.description.toLowerCase().includes('fruit') ||
        label.description.toLowerCase().includes('vegetable') ||
        label.description.toLowerCase().includes('meal')
      );
      
      if (foodLabels.length > 0) {
        const mainFood = foodLabels[0].description;
        const nutritionInfo = await this.getNutritionInfo(mainFood);
        return {
          success: true,
          detectedFood: mainFood,
          confidence: foodLabels[0].score,
          nutritionInfo: nutritionInfo,
          allLabels: labels.map(l => l.description),
        };
      }
      
      return this.getFallbackAnalysis();
    } catch (error) {
      console.error('Google Vision Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  async analyzeWithOCR(imageBuffer) {
    try {
      // Preprocess image with sharp
      const processedImage = await sharp(imageBuffer)
        .resize(800, 800, { fit: 'inside' })
        .grayscale()
        .toBuffer();
      
      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        'eng',
        { logger: m => console.log(m) }
      );
      
      // Look for food-related keywords in OCR text
      const foodKeywords = ['pizza', 'burger', 'salad', 'rice', 'pasta', 'bread', 'chicken', 'fish', 'vegetable', 'fruit'];
      const foundFoods = foodKeywords.filter(keyword => 
        text.toLowerCase().includes(keyword)
      );
      
      if (foundFoods.length > 0) {
        const nutritionInfo = await this.getNutritionInfo(foundFoods[0]);
        return {
          success: true,
          detectedFood: foundFoods[0],
          confidence: 0.7,
          nutritionInfo: nutritionInfo,
          ocrText: text.substring(0, 200),
        };
      }
      
      return this.getFallbackAnalysis();
    } catch (error) {
      console.error('OCR Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  async getNutritionInfo(foodName) {
    try {
      // Try to fetch from Nutrition API (using USDA or similar)
      const nutritionData = await this.fetchNutritionData(foodName);
      
      if (nutritionData) {
        return nutritionData;
      }
      
      // Return default nutrition info based on food name
      return this.getDefaultNutritionInfo(foodName);
    } catch (error) {
      console.error('Nutrition API Error:', error);
      return this.getDefaultNutritionInfo(foodName);
    }
  }

  async fetchNutritionData(foodName) {
    // This would integrate with a nutrition API like USDA, Edamam, etc.
    // For now, return mock data
    try {
      // Example with Edamam API
      if (process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY) {
        const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
          params: {
            app_id: process.env.EDAMAM_APP_ID,
            app_key: process.env.EDAMAM_APP_KEY,
            ingr: foodName,
            nutrition: true,
          },
        });
        
        if (response.data.hints && response.data.hints.length > 0) {
          const food = response.data.hints[0].food;
          return {
            name: food.label,
            calories: food.nutrients.ENERC_KCAL || 0,
            protein: food.nutrients.PROCNT || 0,
            carbs: food.nutrients.CHOCDF || 0,
            fat: food.nutrients.FAT || 0,
            servingSize: food.servingSize || 100,
            unit: food.servingUnit || 'g',
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Fetch Nutrition Data Error:', error);
      return null;
    }
  }

  getDefaultNutritionInfo(foodName) {
    const defaultNutrition = {
      pizza: { calories: 285, protein: 12, carbs: 36, fat: 10, servingSize: 100 },
      burger: { calories: 295, protein: 17, carbs: 30, fat: 12, servingSize: 100 },
      salad: { calories: 50, protein: 2, carbs: 5, fat: 2, servingSize: 100 },
      rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100 },
      pasta: { calories: 158, protein: 5.8, carbs: 31, fat: 0.9, servingSize: 100 },
      bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: 100 },
      chicken: { calories: 239, protein: 27, carbs: 0, fat: 14, servingSize: 100 },
      fish: { calories: 206, protein: 22, carbs: 0, fat: 12, servingSize: 100 },
    };
    
    const normalizedFood = foodName.toLowerCase();
    let nutrition = defaultNutrition[normalizedFood];
    
    if (!nutrition) {
      // Try to find partial match
      const match = Object.keys(defaultNutrition).find(key => 
        normalizedFood.includes(key) || key.includes(normalizedFood)
      );
      nutrition = match ? defaultNutrition[match] : defaultNutrition.salad;
    }
    
    return {
      name: foodName,
      ...nutrition,
      unit: 'g',
    };
  }

  getFallbackAnalysis() {
    return {
      success: false,
      message: "Could not detect food clearly. Please try with a clearer image or enter details manually.",
      manualEntryRequired: true,
    };
  }
}

module.exports = new ImageRecognitionService();