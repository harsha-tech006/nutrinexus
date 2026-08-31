import os
import json
import openai
from config.config import Config

# Disclaimer strings per language
DISCLAIMERS = {
    'english': "\n\n*Disclaimer: I am an AI nutrition assistant. Consult a qualified physician before making medical or extreme diet changes.*",
    'hindi': "\n\n*अस्वीकरण: मैं एक एआई पोषण सहायक हूं। चिकित्सा या अत्यधिक आहार परिवर्तनों के लिए योग्य डॉक्टर से परामर्श लें।*",
    'kannada': "\n\n*ಹಕ್ಕುತ್ಯಾಗ: ನಾನು AI ಪೌಷ್ಟಿಕಾಂಶದ ಸಹಾಯಕ. ಯಾವುದೇ ವೈದ್ಯಕೀಯ ಬದಲಾವಣೆಗಳಿಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.*",
    'tamil': "\n\n*பொறுப்புத் துறப்பு: நான் ஒரு AI ஊட்டச்சத்து உதவியாளர். ஏதேனும் மருத்துவ மாற்றங்களுக்கு மருத்துவரை அணுகவும்.*",
    'telugu': "\n\n*గమనిక: నేను AI పోషకాహార సహాయకుడిని. వైద్య మార్పులకు ముందు వైద్యుడిని సంప్రదించండి.*",
    'malayalam': "\n\n*നിരാകരണം: ഞാൻ ഒരു AI പോഷകാഹാര സഹായിയാണ്. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ കാണുക.*",
    'marathi': "\n\n*अस्वीकरण: मी एक AI पोषण सहाय्यक आहे. कोणत्याही वैद्यकीय बदलांसाठी डॉक्टरांचा सल्ला घ्या.*"
}

def get_disclaimer(language):
    lang_key = str(language).lower()
    for k, v in DISCLAIMERS.items():
        if k in lang_key:
            return v
    return DISCLAIMERS['english']

def generate_mock_chat_response(query, user_profile=None, language='English'):
    name = user_profile.get('name', 'there') if user_profile else 'there'
    bmi = user_profile.get('bmi', 22.5) if user_profile else 22.5
    goal = user_profile.get('goal', 'Healthy Lifestyle') if user_profile else 'Healthy Lifestyle'
    diseases = user_profile.get('diseases', []) if user_profile else []
    
    disease_str = f" considering your history of {', '.join(diseases)}" if diseases else ""
    
    resp = f"Hello {name}! Based on your current health profile (BMI: {bmi}, Goal: {goal}){disease_str}:\n\n"
    resp += "• Ensure a balanced daily macro distribution: 50% Carbs, 30% Protein, and 20% Healthy Fats.\n"
    resp += "• Stay hydrated by drinking at least 2.5 - 3.0 Liters of water daily.\n"
    resp += "• Prioritize whole foods, fiber-rich vegetables, lean proteins, and avoid processed sugars."
    
    return resp + get_disclaimer(language)

def generate_ai_chat_response(messages, user_profile=None, language='English'):
    api_key = Config.OPENAI_API_KEY
    if not api_key:
        last_msg = messages[-1]['content'] if messages else "health guidance"
        return generate_mock_chat_response(last_msg, user_profile, language)
    
    try:
        openai.api_key = api_key
        system_prompt = (
            f"You are NutriNexus, an expert clinical AI Nutritionist and Health Assistant. "
            f"Always reply in the requested language: {language}. "
            f"User Profile: {json.dumps(user_profile or {})}."
        )

        formatted_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            formatted_messages.append({
                "role": m.get("role", "user"),
                "content": m.get("content", "")
            })

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=formatted_messages,
            temperature=0.7,
            max_tokens=500
        )
        reply = response.choices[0].message.content
        return reply + get_disclaimer(language)
    except Exception as e:
        print(f"[OpenAI API Chat Exception]: {e}")
        last_msg = messages[-1]['content'] if messages else "health guidance"
        return generate_mock_chat_response(last_msg, user_profile, language)

def generate_mock_meal_plan(user_profile=None):
    pref = (user_profile.get('dietary_preference') if user_profile else None) or 'Vegetarian'
    goal = (user_profile.get('goal') if user_profile else None) or 'Weight Loss'
    
    return {
        "title": f"Customized {pref} {goal} Plan",
        "description": "Balanced clinical macro breakdown optimized for your target metrics.",
        "weekly_meals": {
            "Monday": {
                "breakfast": "Oatmeal with chia seeds, sliced almonds, and berries (350 kcal)",
                "lunch": "Quinoa salad bowl with chickpeas, avocado, and olive oil dressing (500 kcal)",
                "snack": "Greek yogurt or roasted makhana (150 kcal)",
                "dinner": "Lentil soup (Dal) with steamed brown rice and mixed green salad (450 kcal)"
            },
            "Tuesday": {
                "breakfast": "Multigrain toast with avocado and boiled egg / sprouts (380 kcal)",
                "lunch": "Grilled tofu / paneer wrap with spinach and bell peppers (520 kcal)",
                "snack": "Handful of walnuts and green tea (140 kcal)",
                "dinner": "Stir-fried vegetables with quinoa or millet chapati (440 kcal)"
            },
            "Wednesday": {
                "breakfast": "Vegetable Moong Dal Chilla / Omelette with mint chutney (340 kcal)",
                "lunch": "Brown rice with rajma (kidney bean curry) and cucumber raita (530 kcal)",
                "snack": "Sliced apple with 1 tbsp peanut butter (160 kcal)",
                "dinner": "Mixed vegetable soup with grilled cottage cheese / paneer (420 kcal)"
            },
            "Thursday": {
                "breakfast": "Smoothie bowl with spinach, banana, protein powder, and flaxseeds (360 kcal)",
                "lunch": "Whole wheat rotis (2) with palak paneer and salad (510 kcal)",
                "snack": "Roasted chickpeas (chana) (150 kcal)",
                "dinner": "Vegetable khichdi with 1 tsp ghee and curd (450 kcal)"
            },
            "Friday": {
                "breakfast": "Idli (3) or Sambar Dosa with coconut chutney (350 kcal)",
                "lunch": "Chickpea and avocado Buddha bowl with lemon tahini dressing (500 kcal)",
                "snack": "Handful of almonds and pumpkin seeds (150 kcal)",
                "dinner": "Soya chunk curry with steamed quinoa and salad (460 kcal)"
            },
            "Saturday": {
                "breakfast": "Poha with peanuts, curry leaves, and lemon juice (330 kcal)",
                "lunch": "Stuffed Paratha (paneer/gobhi) with low-fat curd and bowl of sprouts (540 kcal)",
                "snack": "Coconut water and roasted makhana (130 kcal)",
                "dinner": "Lentil dal with mixed vegetable sabzi and 2 phulkas (440 kcal)"
            },
            "Sunday": {
                "breakfast": "Besan chilla with grated vegetables and herbal tea (320 kcal)",
                "lunch": "Vegetable Biryani with cucumber pomegranate raita (550 kcal)",
                "snack": "Fruit bowl (papaya, apple, berries) (140 kcal)",
                "dinner": "Clear vegetable soup with paneer tikka / grilled tofu (420 kcal)"
            }
        }
    }

def generate_ai_meal_plan(user_profile=None, language='English'):
    api_key = Config.OPENAI_API_KEY
    if not api_key:
        return generate_mock_meal_plan(user_profile)

    try:
        openai.api_key = api_key
        prompt = (
            f"Generate a customized 7-day meal recommendation plan in JSON format. "
            f"Language: {language}. Profile: {json.dumps(user_profile or {})}."
        )

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a professional clinical dietitian. Output valid JSON only."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"[OpenAI API Meal Plan Exception]: {e}")
        return generate_mock_meal_plan(user_profile)
