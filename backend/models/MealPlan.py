import datetime
import random
from bson import ObjectId
from database.db import get_db

class MealPlan:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['mealplans']

    @classmethod
    def get_by_date(cls, user_id, date_str):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return cls.get_collection().find_one({"user_id": user_id, "date": date_str})

    @classmethod
    def create_or_update(cls, user_id, date_str, plan_data):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        collection = cls.get_collection()
        plan_data["user_id"] = user_id
        plan_data["date"] = date_str
        plan_data["updated_at"] = datetime.datetime.utcnow()
        
        existing = collection.find_one({"user_id": user_id, "date": date_str})
        if existing:
            collection.update_one({"_id": existing["_id"]}, {"$set": plan_data})
            plan_data["_id"] = existing["_id"]
        else:
            plan_data["created_at"] = datetime.datetime.utcnow()
            result = collection.insert_one(plan_data)
            plan_data["_id"] = result.inserted_id
            
        return plan_data

    @classmethod
    def mark_meal_eaten(cls, user_id, date_str, meal_type, eaten_status=True):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        collection = cls.get_collection()
        plan = collection.find_one({"user_id": user_id, "date": date_str})
        if not plan:
            return None
            
        meal_key = f"meals.{meal_type}.eaten"
        collection.update_one(
            {"_id": plan["_id"]},
            {"$set": {meal_key: eaten_status, "updated_at": datetime.datetime.utcnow()}}
        )
        return collection.find_one({"_id": plan["_id"]})

    @classmethod
    def mark_skipped(cls, user_id, date_str, meal_type, skipped_status=True):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        collection = cls.get_collection()
        plan = collection.find_one({"user_id": user_id, "date": date_str})
        if not plan:
            return None
            
        meal_key = f"meals.{meal_type}.skipped"
        updates = {
            meal_key: skipped_status,
            "updated_at": datetime.datetime.utcnow()
        }
        if skipped_status:
            # If a meal is marked skipped, it cannot be eaten
            updates[f"meals.{meal_type}.eaten"] = False
            
        collection.update_one(
            {"_id": plan["_id"]},
            {"$set": updates}
        )
        return collection.find_one({"_id": plan["_id"]})

    @classmethod
    def update_water_consumed(cls, user_id, date_str, water_ml):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        collection = cls.get_collection()
        plan = collection.find_one({"user_id": user_id, "date": date_str})
        if not plan:
            return None
            
        collection.update_one(
            {"_id": plan["_id"]},
            {"$set": {"water_consumed_ml": water_ml, "updated_at": datetime.datetime.utcnow()}}
        )
        return collection.find_one({"_id": plan["_id"]})

    @classmethod
    def generate_local_plan(cls, user_profile, date_str):
        """Rule-based local AI meal planner aligning with user health conditions."""
        name = user_profile.get('name', 'User')
        gender = user_profile.get('gender', 'Male')
        age = int(user_profile.get('age', 30))
        weight = float(user_profile.get('weight', 70))
        height = float(user_profile.get('height', 170))
        bmi = float(user_profile.get('bmi', 24))
        activity = user_profile.get('activity_level', 'Moderate')
        goal = user_profile.get('goal', 'Healthy Lifestyle')
        diseases = user_profile.get('diseases', [])
        is_veg = user_profile.get('dietary_preference', 'Vegetarian') == 'Vegetarian'

        # 1. Compute target calories
        if gender == 'Male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161

        multiplier = 1.2
        if activity == 'Lightly Active': multiplier = 1.375
        elif activity == 'Moderately Active': multiplier = 1.55
        elif activity == 'Very Active': multiplier = 1.725

        tdee = bmr * multiplier

        if goal == 'Weight Loss':
            target_calories = tdee - 400
        elif goal == 'Weight Gain' or goal == 'Muscle Gain':
            target_calories = tdee + 300
        else:
            target_calories = tdee

        target_calories = max(1200.0, min(3500.0, target_calories))

        # 2. Determine target macros
        if 'Diabetes' in diseases:
            p_pct, c_pct, f_pct = 0.25, 0.40, 0.35
        elif 'PCOS' in diseases or 'PCOD' in diseases:
            p_pct, c_pct, f_pct = 0.30, 0.35, 0.35
        elif goal == 'Muscle Gain':
            p_pct, c_pct, f_pct = 0.30, 0.45, 0.25
        elif goal == 'Weight Loss':
            p_pct, c_pct, f_pct = 0.28, 0.42, 0.30
        else:
            p_pct, c_pct, f_pct = 0.20, 0.50, 0.30

        protein_g = (target_calories * p_pct) / 4.0
        carbs_g = (target_calories * c_pct) / 4.0
        fat_g = (target_calories * f_pct) / 9.0
        fiber_g = 25.0
        if 'Diabetes' in diseases or 'Obesity' in diseases:
            fiber_g = 35.0

        # 3. Determine Water Intake Goal
        water_goal = 2500
        if weight > 80: water_goal += 500
        if activity in ['Moderately Active', 'Very Active']: water_goal += 500
        if 'Kidney Disease' in diseases:
            water_goal = 1800

        # 4. Generate meals based on conditions and preferences
        breakfast_lib = [
            {
                "name": "Oats porridge with Banana & Almonds",
                "imageUrl": "/assets/meals/oats.jpg",
                "calories": 320, "protein": 12, "carbs": 48, "fat": 8, "fiber": 8,
                "serving_size": "1 bowl (approx. 250g)", "prep_time": "8 mins",
                "healthy_alternative": "Ragi Porridge",
                "recipe": "Boil rolled oats in almond milk. Top with sliced banana, flaxseeds, and chopped almonds.",
                "benefits": ["High in beta-glucan fiber", "Improves digestion", "Heart healthy"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Sprouted Moong Dal Chilla",
                "imageUrl": "/assets/meals/moong_dal.jpg",
                "calories": 280, "protein": 16, "carbs": 38, "fat": 6, "fiber": 7,
                "serving_size": "2 chillas", "prep_time": "15 mins",
                "healthy_alternative": "Besan Chilla",
                "recipe": "Blend soaked sprouts with green chili and ginger. Spread on non-stick pan, cook until crispy.",
                "benefits": ["Rich in plant protein", "Low glycemic index", "Stabilizes insulin"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Egg White & Spinach Omelet",
                "imageUrl": "/assets/meals/avocado_toast.jpg",
                "calories": 250, "protein": 22, "carbs": 8, "fat": 14, "fiber": 3,
                "serving_size": "1 plate", "prep_time": "10 mins",
                "healthy_alternative": "Tofu Scramble",
                "recipe": "Whisk 4 egg whites with spinach, mushrooms, and black pepper. Cook in olive oil.",
                "benefits": ["Extremely high protein", "Zero sugar", "Aids fat burn"],
                "veg": False, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Avocado and Whole-Wheat Toast",
                "imageUrl": "/assets/meals/avocado_toast.jpg",
                "calories": 340, "protein": 9, "carbs": 32, "fat": 18, "fiber": 9,
                "serving_size": "2 slices", "prep_time": "5 mins",
                "healthy_alternative": "Hummus Toast",
                "recipe": "Mash avocado with lemon juice, salt, and pepper. Spread on toasted multigrain bread.",
                "benefits": ["High in monounsaturated fats", "Reduces LDL cholesterol", "Rich in fiber"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            }
        ]

        snack_morning_lib = [
            {
                "name": "Apple Slices with Almond Butter",
                "imageUrl": "/assets/meals/apple_peanut.jpg",
                "calories": 150, "protein": 4, "carbs": 18, "fat": 8, "fiber": 5,
                "serving_size": "1 medium apple + 1 tbsp butter", "prep_time": "3 mins",
                "healthy_alternative": "Pear slices",
                "recipe": "Core and slice apple, serve with plain sugar-free almond butter.",
                "benefits": ["Pectin fiber curbs hunger", "Provides clean brain energy"],
                "veg": True
            },
            {
                "name": "Mixed Berries with Chia seeds",
                "imageUrl": "/assets/meals/chia_pudding.jpg",
                "calories": 110, "protein": 2, "carbs": 16, "fat": 3, "fiber": 6,
                "serving_size": "1 cup", "prep_time": "2 mins",
                "healthy_alternative": "Grapefruit sections",
                "recipe": "Mix strawberries, blueberries, and raspberries. Sprinkle with ground chia seeds.",
                "benefits": ["Antioxidant powerhouse", "Anti-inflammatory"],
                "veg": True
            }
        ]

        lunch_lib = [
            {
                "name": "Quinoa Veggie Salad with Chickpeas",
                "imageUrl": "/assets/meals/quinoa_salad.jpg",
                "calories": 480, "protein": 18, "carbs": 62, "fat": 14, "fiber": 12,
                "serving_size": "1 large bowl", "prep_time": "20 mins",
                "healthy_alternative": "Brown Rice Bowl",
                "recipe": "Toss cooked quinoa, boiled chickpeas, cucumber, cherry tomatoes, and feta cheese with lemon vinaigrette.",
                "benefits": ["Complete protein profile", "Highly filling", "Slow release carbohydrates"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Brown Rice with Mixed Dal & Steamed Broccoli",
                "imageUrl": "/assets/meals/brown_rice.jpg",
                "calories": 450, "protein": 15, "carbs": 70, "fat": 9, "fiber": 9,
                "serving_size": "1 plate", "prep_time": "25 mins",
                "healthy_alternative": "Millet Khichdi",
                "recipe": "Steam brown basmati rice. Serve with split yellow lentil dal and broccoli sautéed in olive oil.",
                "benefits": ["Provides long-lasting energy", "Supports gut microbiome", "Liver friendly"],
                "veg": True, "diabetes_safe": True, "pcos_safe": False
            },
            {
                "name": "Grilled Chicken Breast with Quinoa & Asparagus",
                "imageUrl": "/assets/meals/grilled_chicken.jpg",
                "calories": 520, "protein": 42, "carbs": 38, "fat": 12, "fiber": 6,
                "serving_size": "1 plate", "prep_time": "20 mins",
                "healthy_alternative": "Grilled Tofu Platter",
                "recipe": "Marinate chicken with garlic and herbs. Grill. Serve alongside cooked quinoa and asparagus.",
                "benefits": ["Lean muscle support", "Extremely low glycemic load"],
                "veg": False, "diabetes_safe": True, "pcos_safe": True
            }
        ]

        snack_evening_lib = [
            {
                "name": "Roasted Masala Chickpeas",
                "imageUrl": "/assets/meals/chickpeas.jpg",
                "calories": 160, "protein": 8, "carbs": 24, "fat": 3, "fiber": 6,
                "serving_size": "1 small cup (50g)", "prep_time": "5 mins",
                "healthy_alternative": "Roasted Makhana",
                "recipe": "Toss boiled chickpeas with turmeric, chili powder, and salt. Dry roast until crunchy.",
                "benefits": ["Fiber prevents evening insulin spikes", "Low calorie savory snack"],
                "veg": True
            },
            {
                "name": "Handful of Walnuts & Almonds",
                "imageUrl": "/assets/meals/mixed_nuts.jpg",
                "calories": 180, "protein": 6, "carbs": 6, "fat": 16, "fiber": 3,
                "serving_size": "30g", "prep_time": "1 min",
                "healthy_alternative": "Pumpkin seeds",
                "recipe": "Mix raw unsalted almonds and walnuts.",
                "benefits": ["High in Omega-3 fatty acids", "Excellent for heart and thyroid health"],
                "veg": True
            }
        ]

        dinner_lib = [
            {
                "name": "Tofu Stir-fry with Bell Peppers & Spinach",
                "imageUrl": "/assets/meals/paneer_stir_fry.jpg",
                "calories": 380, "protein": 19, "carbs": 18, "fat": 16, "fiber": 8,
                "serving_size": "1 large plate", "prep_time": "15 mins",
                "healthy_alternative": "Paneer Bhurji",
                "recipe": "Sauté firm tofu cubes with bell peppers, spinach, garlic, and sesame seeds in olive oil.",
                "benefits": ["Highly anti-inflammatory", "High plant protein", "Promotes restful sleep"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Baked Herb-Crusted Salmon with Cauliflower Mash",
                "imageUrl": "/assets/meals/baked_fish.jpg",
                "calories": 440, "protein": 34, "carbs": 12, "fat": 22, "fiber": 5,
                "serving_size": "1 plate", "prep_time": "22 mins",
                "healthy_alternative": "Baked Tofu Steaks",
                "recipe": "Bake salmon fillet with dill and lemon juice. Mash boiled cauliflower with garlic and olive oil.",
                "benefits": ["Unsaturated Omega-3 fatty acids", "Ultra low glycemic index", "Hormonal balancing"],
                "veg": False, "diabetes_safe": True, "pcos_safe": True
            },
            {
                "name": "Thick Red Lentil (Masoor Dal) Soup",
                "imageUrl": "/assets/meals/veg_soup.jpg",
                "calories": 310, "protein": 16, "carbs": 44, "fat": 5, "fiber": 11,
                "serving_size": "2 large bowls", "prep_time": "18 mins",
                "healthy_alternative": "Clear Vegetable Soup",
                "recipe": "Pressure cook red lentils with tomatoes, garlic, cumin, and spinach. Blend slightly.",
                "benefits": ["Easy to digest at night", "Fiber-rich, low fat", "Kidney-safe choice"],
                "veg": True, "diabetes_safe": True, "pcos_safe": True
            }
        ]

        def filter_meals(lib, is_veg, is_diabetic, is_pcos):
            valid = []
            for m in lib:
                if is_veg and not m.get("veg", True):
                    continue
                if is_diabetic and not m.get("diabetes_safe", True):
                    continue
                if is_pcos and not m.get("pcos_safe", True):
                    continue
                valid.append(m)
            if not valid:
                valid = [m for m in lib if m.get("veg", True)]
            return random.choice(valid)

        is_diabetic = 'Diabetes' in diseases
        is_pcos = 'PCOS' in diseases or 'PCOD' in diseases

        bf = filter_meals(breakfast_lib, is_veg, is_diabetic, is_pcos)
        ms = filter_meals(snack_morning_lib, is_veg, is_diabetic, is_pcos)
        ln = filter_meals(lunch_lib, is_veg, is_diabetic, is_pcos)
        es = filter_meals(snack_evening_lib, is_veg, is_diabetic, is_pcos)
        dn = filter_meals(dinner_lib, is_veg, is_diabetic, is_pcos)

        total_meal_cals = bf['calories'] + ms['calories'] + ln['calories'] + es['calories'] + dn['calories']
        factor = target_calories / total_meal_cals if total_meal_cals > 0 else 1.0

        def scale(meal, factor, sched):
            m = meal.copy()
            m['calories'] = int(m['calories'] * factor)
            m['protein'] = int(m['protein'] * factor)
            m['carbs'] = int(m['carbs'] * factor)
            m['fat'] = int(m['fat'] * factor)
            m['fiber'] = int(m['fiber'] * factor)
            m['eaten'] = False
            m['skipped'] = False
            m['schedule'] = sched
            return m

        bf = scale(bf, factor, "7:00–9:00 AM")
        ms = scale(ms, factor, "10:30 AM")
        ln = scale(ln, factor, "1:00 PM")
        es = scale(es, factor, "4:30 PM")
        dn = scale(dn, factor, "7:30–9:00 PM")

        tips = [
            "🥗 Eat slowly and chew your food thoroughly to aid digestion.",
            "💧 Drink at least 2.5–3.5 liters of water daily to maintain proper cellular function.",
            "🥜 Include a reliable source of protein in every single meal to protect lean muscle tissue.",
            "🍎 Prioritize eating fresh seasonal fruits instead of canned items to get natural vitamins.",
            "🚫 Avoid combining high-GI refined grains with sugary drinks to prevent insulin surges.",
            "🚶 Go for a short 10-minute walk post meals to assist in glycemic stabilization."
        ]
        if is_diabetic:
            tips.append("🥦 Prioritize high-fiber vegetables first in your meals to slow down glucose absorption.")
        if is_pcos:
            tips.append("🥑 Incorporate healthy fats like flaxseeds and pumpkin seeds to support hormonal synthesis.")

        daily_tip = random.choice(tips)

        plan_data = {
            "plan_type": "daily",
            "meals": {
                "breakfast": bf,
                "morning_snack": ms,
                "lunch": ln,
                "evening_snack": es,
                "dinner": dn
            },
            "water_goal_ml": water_goal,
            "water_consumed_ml": 0,
            "daily_tip": daily_tip,
            "nutrition_summary": {
                "target_calories": round(target_calories, 1),
                "target_protein": round(protein_g, 1),
                "target_carbs": round(carbs_g, 1),
                "target_fat": round(fat_g, 1),
                "target_fiber": round(fiber_g, 1)
            }
        }

        return plan_data
