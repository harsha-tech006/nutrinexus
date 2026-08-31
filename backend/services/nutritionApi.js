const axios = require('axios');

class NutritionAPI {
  constructor() {
    this.edamamAppId = process.env.EDAMAM_APP_ID;
    this.edamamAppKey = process.env.EDAMAM_APP_KEY;
    this.usdaApiKey = process.env.USDA_API_KEY;
  }

  async searchFood(query) {
    try {
      // Try Edamam API first
      if (this.edamamAppId && this.edamamAppKey) {
        const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
          params: {
            app_id: this.edamamAppId,
            app_key: this.edamamAppKey,
            ingr: query,
            nutrition: true,
          },
        });

        if (response.data.hints && response.data.hints.length > 0) {
          return response.data.hints.map(hint => ({
            name: hint.food.label,
            calories: hint.food.nutrients.ENERC_KCAL || 0,
            protein: hint.food.nutrients.PROCNT || 0,
            carbs: hint.food.nutrients.CHOCDF || 0,
            fat: hint.food.nutrients.FAT || 0,
            servingSize: hint.food.servingSize || 100,
            unit: hint.food.servingUnit || 'g',
            image: hint.food.image,
          }));
        }
      }

      // Fallback to USDA API
      if (this.usdaApiKey) {
        const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            api_key: this.usdaApiKey,
            query: query,
            pageSize: 5,
          },
        });

        if (response.data.foods && response.data.foods.length > 0) {
          return response.data.foods.map(food => ({
            name: food.description,
            calories: this.extractNutrient(food.foodNutrients, 'Energy'),
            protein: this.extractNutrient(food.foodNutrients, 'Protein'),
            carbs: this.extractNutrient(food.foodNutrients, 'Carbohydrate'),
            fat: this.extractNutrient(food.foodNutrients, 'Total lipid'),
            servingSize: 100,
            unit: 'g',
          }));
        }
      }

      return this.getLocalNutritionData(query);
    } catch (error) {
      console.error('Nutrition API Error:', error);
      return this.getLocalNutritionData(query);
    }
  }

  extractNutrient(nutrients, nutrientName) {
    const nutrient = nutrients.find(n => 
      n.nutrientName && n.nutrientName.includes(nutrientName)
    );
    return nutrient ? nutrient.value : 0;
  }

  getLocalNutritionData(query) {
    const localDatabase = {
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
      'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      'salad': { calories: 50, protein: 2, carbs: 5, fat: 2 },
      'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10 },
      'burger': { calories: 295, protein: 17, carbs: 30, fat: 12 },
    };

    const normalizedQuery = query.toLowerCase();
    let matchedFood = null;
    
    for (const [food, nutrition] of Object.entries(localDatabase)) {
      if (normalizedQuery.includes(food)) {
        matchedFood = { name: food, ...nutrition, servingSize: 100, unit: 'g' };
        break;
      }
    }

    return matchedFood ? [matchedFood] : [];
  }

  async getRecipeRecommendations(dietaryRestrictions, mealType) {
    try {
      if (this.edamamAppId && this.edamamAppKey) {
        const response = await axios.get('https://api.edamam.com/api/recipes/v2', {
          params: {
            type: 'public',
            app_id: this.edamamAppId,
            app_key: this.edamamAppKey,
            q: mealType,
            diet: dietaryRestrictions.join(','),
            health: 'vegetarian',
          },
        });

        return response.data.hits.map(hit => ({
          label: hit.recipe.label,
          image: hit.recipe.image,
          calories: Math.round(hit.recipe.calories),
          totalTime: hit.recipe.totalTime,
          ingredients: hit.recipe.ingredientLines,
          url: hit.recipe.url,
        }));
      }
      return [];
    } catch (error) {
      console.error('Recipe API Error:', error);
      return [];
    }
  }
}

module.exports = new NutritionAPI();