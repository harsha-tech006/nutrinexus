from flask import jsonify, request, g
from models.CycleTracker import CycleTracker
from models.PregnancyProfile import PregnancyProfile
import datetime

def calculate_cycle_phase_details(last_period_date_str, cycle_length, period_duration):
    """Calculate current cycle phase, next period date, ovulation window, and phase nutrition."""
    try:
        last_date = datetime.date.fromisoformat(last_period_date_str)
    except Exception:
        last_date = datetime.date.today() - datetime.timedelta(days=10)

    today = datetime.date.today()
    days_since_last = (today - last_date).days
    current_day_in_cycle = (days_since_last % cycle_length) + 1

    next_period_date = last_date + datetime.timedelta(days=cycle_length)
    if next_period_date < today:
        cycles_passed = ((today - last_date).days // cycle_length) + 1
        next_period_date = last_date + datetime.timedelta(days=cycle_length * cycles_passed)

    days_until_next_period = (next_period_date - today).days

    # Ovulation is roughly day (cycle_length - 14)
    ovulation_day = max(1, cycle_length - 14)
    fertile_start_day = max(1, ovulation_day - 5)
    fertile_end_day = min(cycle_length, ovulation_day + 1)

    fertile_start_date = last_date + datetime.timedelta(days=fertile_start_day - 1)
    fertile_end_date = last_date + datetime.timedelta(days=fertile_end_day - 1)
    ovulation_date = last_date + datetime.timedelta(days=ovulation_day - 1)

    # Determine Phase
    if current_day_in_cycle <= period_duration:
        phase_name = "Menstrual Phase"
        phase_color = "rose"
        phase_summary = "Estrogen and progesterone drop. Focus on iron replenishment and cramp-relieving anti-inflammatory foods."
        phase_nutrition = {
            "key_focus": "Iron Loading & Anti-Inflammatory Comfort",
            "foods_to_eat": ["Spinach & Dark Leafy Greens", "Lentils & Beans", "Dark Chocolate (70%+)", "Turmeric Ginger Tea", "Beetroot Juice", "Pumpkin Seeds"],
            "foods_to_avoid": ["Excessive Sodium", "Refined Sugars", "Alcohol", "Heavy Fried Foods"],
            "recommended_nutrients": ["Iron (18-27mg)", "Magnesium (320mg)", "Omega-3 Fatty Acids", "Vitamin C"]
        }
    elif current_day_in_cycle < fertile_start_day:
        phase_name = "Follicular Phase"
        phase_color = "emerald"
        phase_summary = "FSH rises to stimulate follicle growth. Energy levels rebound. Enjoy light, vibrant, high-protein nutrition."
        phase_nutrition = {
            "key_focus": "Protein Building & Estrogen Balance",
            "foods_to_eat": ["Lean Poultry & Tofu", "Fermented Foods (Yogurt, Kimchi)", "Cruciferous Veggies (Broccoli)", "Avocado", "Sprouted Grains", "Blueberries"],
            "foods_to_avoid": ["Heavy Processed Meats", "High Sodium Snacks"],
            "recommended_nutrients": ["Vitamin E", "Zinc", "B-Complex Vitamins", "Probiotics"]
        }
    elif current_day_in_cycle <= fertile_end_day:
        phase_name = "Ovulatory Phase (Peak Fertility)"
        phase_color = "amber"
        phase_summary = "LH surge triggers egg release. Energy and metabolism peak. Focus on high-antioxidant and fiber-dense foods."
        phase_nutrition = {
            "key_focus": "Antioxidants & Glutathione Boosters",
            "foods_to_eat": ["Raspberries & Strawberries", "Wild Salmon & Flaxseeds", "Asparagus & Brussels Sprouts", "Quinoa", "Walnuts", "Green Tea"],
            "foods_to_avoid": ["Heavy Trans-Fats", "Excessive Caffeine"],
            "recommended_nutrients": ["Folate", "Glutathione", "Omega-3 DHA", "Calcium"]
        }
    else:
        phase_name = "Luteal Phase"
        phase_color = "purple"
        phase_summary = "Progesterone rises. Metabolism increases. Magnesium and complex carbs prevent PMS cravings and mood dips."
        phase_nutrition = {
            "key_focus": "Magnesium Support & PMS Craving Control",
            "foods_to_eat": ["Sweet Potatoes & Squash", "Brown Rice & Oats", "Bananas & Dark Chocolate", "Sunflower Seeds", "Chamomile & Peppermint Tea"],
            "foods_to_avoid": ["Refined White Flour", "Excess Salt (causes bloating)", "Caffeine"],
            "recommended_nutrients": ["Magnesium", "Vitamin B6", "Calcium", "Fiber"]
        }

    return {
        "current_day": current_day_in_cycle,
        "cycle_length": cycle_length,
        "period_duration": period_duration,
        "phase_name": phase_name,
        "phase_color": phase_color,
        "phase_summary": phase_summary,
        "days_until_next_period": days_until_next_period,
        "next_period_date": next_period_date.isoformat(),
        "ovulation_date": ovulation_date.isoformat(),
        "is_fertile_window": (fertile_start_day <= current_day_in_cycle <= fertile_end_day),
        "fertile_window_range": f"{fertile_start_date.strftime('%b %d')} - {fertile_end_date.strftime('%b %d')}",
        "phase_nutrition": phase_nutrition
    }

def get_cycle_status():
    """Retrieve cycle status, phase analysis, and recent symptom logs."""
    try:
        user_id = getattr(g, 'user_id', 'demo_user')
        cycle = CycleTracker.get_user_cycle(user_id)
        phase_info = calculate_cycle_phase_details(
            cycle.get("last_period_date"),
            cycle.get("cycle_length", 28),
            cycle.get("period_duration", 5)
        )
        recent_symptoms = CycleTracker.get_recent_symptom_logs(user_id, limit=7)

        cramp_relief_remedies = [
            {
                "title": "Warm Chamomile & Ginger Infusion",
                "type": "Herbal Remedy",
                "description": "Ginger inhibits pain-inducing prostaglandins while chamomile relaxes uterine muscle spasms."
            },
            {
                "title": "Magnesium & Potassium Hydration",
                "type": "Micronutrient",
                "description": "Drink warm coconut water with a pinch of sea salt and lemon to reduce smooth muscle cramps."
            },
            {
                "title": "Supta Baddha Konasana (Reclined Butterfly)",
                "type": "Gentle Yoga",
                "description": "Relieves pelvic pressure, eases lower back ache, and stimulates ovarian blood circulation."
            }
        ]

        return jsonify({
            "success": True,
            "cycle_settings": cycle,
            "phase_info": phase_info,
            "recent_symptoms": recent_symptoms,
            "cramp_relief_remedies": cramp_relief_remedies
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def update_cycle_settings():
    """Update user period start date, cycle length, and duration."""
    try:
        user_id = getattr(g, 'user_id', 'demo_user')
        data = request.get_json() or {}
        updated = CycleTracker.save_user_cycle(user_id, data)
        phase_info = calculate_cycle_phase_details(
            updated.get("last_period_date"),
            updated.get("cycle_length", 28),
            updated.get("period_duration", 5)
        )
        return jsonify({
            "success": True,
            "message": "Menstrual cycle settings updated successfully!",
            "cycle_settings": updated,
            "phase_info": phase_info
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def log_period_symptoms():
    """Log daily period pain level (0-10), flow, and symptoms."""
    try:
        user_id = getattr(g, 'user_id', 'demo_user')
        data = request.get_json() or {}
        entry = CycleTracker.log_symptoms(user_id, data)
        return jsonify({
            "success": True,
            "message": "Daily symptoms and period pain log saved!",
            "log": entry
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def get_pregnancy_nutrition_data():
    """Retrieve pregnancy trimester guidelines, micronutrient targets, and food safety matrix."""
    try:
        user_id = getattr(g, 'user_id', 'demo_user')
        profile = PregnancyProfile.get_profile(user_id)
        trimester = profile.get("trimester", 2)

        trimester_data = {
            1: {
                "title": "First Trimester (Weeks 1 - 12)",
                "calorie_delta": "+0 to +100 kcal/day",
                "protein_target": "75g / day",
                "key_focus": "Neural tube development & Morning sickness management",
                "fetal_size_milestone": "Lime / Plum (approx. 5.4 cm)",
                "essential_micronutrients": [
                    {"name": "Folic Acid (Folate)", "target": "600 mcg/day", "reason": "Prevents neural tube defects and supports spinal cord development.", "sources": "Spinach, Lentils, Fortified Cereals, Avocados"},
                    {"name": "Vitamin B6 (Pyridoxine)", "target": "1.9 mg/day", "reason": "Reduces nausea, morning sickness, and hormonal vomiting.", "sources": "Bananas, Chickpeas, Whole Grains, Chicken"},
                    {"name": "Iron", "target": "27 mg/day", "reason": "Builds hemoglobin to supply oxygen to placenta and fetus.", "sources": "Lean Meat, Beans, Pumpkin Seeds, Tofu"}
                ]
            },
            2: {
                "title": "Second Trimester (Weeks 13 - 26)",
                "calorie_delta": "+340 kcal/day",
                "protein_target": "85g / day",
                "key_focus": "Bone mineralization & Fetal brain development",
                "fetal_size_milestone": "Ear of Corn / Papaya (approx. 35 cm)",
                "essential_micronutrients": [
                    {"name": "Calcium", "target": "1000 mg/day", "reason": "Builds fetal bones and tooth buds without depleting mother's skeleton.", "sources": "Greek Yogurt, Skim Milk, Tofu, Almonds, Sesame Seeds"},
                    {"name": "DHA (Omega-3 Fatty Acid)", "target": "300 mg/day", "reason": "Crucial for fetal cerebral cortex and retinal vision development.", "sources": "Wild Salmon, Chia Seeds, Flaxseed Oil, Algae Supplements"},
                    {"name": "Vitamin D3", "target": "600 IU/day", "reason": "Ensures efficient calcium absorption and immune system health.", "sources": "Fortified Dairy, Egg Yolks, Morning Sun Exposure"}
                ]
            },
            3: {
                "title": "Third Trimester (Weeks 27 - 40)",
                "calorie_delta": "+450 kcal/day",
                "protein_target": "100g / day",
                "key_focus": "Rapid fetal weight gain & Maternal energy stamina",
                "fetal_size_milestone": "Watermelon (approx. 48-52 cm)",
                "essential_micronutrients": [
                    {"name": "Iron & Vitamin C", "target": "27 mg + 85 mg", "reason": "Prevents maternal anemia during delivery and aids oxygen circulation.", "sources": "Citrus fruits paired with iron-rich legumes"},
                    {"name": "Choline", "target": "450 mg/day", "reason": "Supports placental function and long-term memory tissue growth.", "sources": "Eggs, Chicken Breast, Salmon, Broccoli"},
                    {"name": "Zinc", "target": "11 mg/day", "reason": "Supports rapid cell division and tissue repair before birth.", "sources": "Oats, Cashews, Dairy, Beans"}
                ]
            }
        }

        foods_to_eat = [
            {"category": "Proteins", "items": ["Well-cooked poultry & eggs", "Steamed tofu & edamame", "Fully cooked low-mercury fish (Salmon, Tilapia)"]},
            {"category": "Greens & Folate", "items": ["Steamed spinach & kale", "Lentil soups & chickpea salad", "Avocados & asparagus"]},
            {"category": "Calcium & Dairy", "items": ["Pasteurized Greek yogurt", "Fortified almond/soy milk", "Cottage cheese (Paneer)"]},
            {"category": "Hydration & Fiber", "items": ["Minimum 2.5 - 3.0L water daily", "Chia seed puddings", "Oatmeal with berries"]}
        ]

        foods_to_avoid = [
            {"category": "Raw / Undercooked Foods", "reason": "Risk of Listeria & Salmonella infection", "items": ["Raw sushi / sashimi", "Soft-boiled or runny eggs", "Unpasteurized milk or cheese (Feta, Brie)"]},
            {"category": "High Mercury Fish", "reason": "Heavy metal damage to fetal nervous system", "items": ["King Mackerel", "Shark", "Swordfish", "Tilefish"]},
            {"category": "Caffeine & Stimulants", "reason": "Crosses placenta, restricts growth", "items": ["Limit total caffeine under 200mg/day (1 cup coffee max)", "Avoid energy drinks"]}
        ]

        morning_sickness_remedies = [
            {"remedy": "Cold Ginger & Lemon Sparkler", "desc": "Sip fresh ginger root infused water with a dash of lemon."},
            {"remedy": "Dry Toast / Crackers at Bedside", "desc": "Nibble dry whole grain crackers 10 minutes before sitting up in bed."},
            {"remedy": "Small Frequent Meals", "desc": "Eat 6 mini-meals every 2.5 hours to keep stomach from remaining empty."}
        ]

        return jsonify({
            "success": True,
            "pregnancy_profile": profile,
            "active_trimester_info": trimester_data.get(trimester, trimester_data[2]),
            "all_trimesters": trimester_data,
            "foods_to_eat": foods_to_eat,
            "foods_to_avoid": foods_to_avoid,
            "morning_sickness_remedies": morning_sickness_remedies
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

def update_pregnancy_profile():
    """Update user's pregnancy trimester and due date."""
    try:
        user_id = getattr(g, 'user_id', 'demo_user')
        data = request.get_json() or {}
        updated = PregnancyProfile.save_profile(user_id, data)
        return jsonify({
            "success": True,
            "message": "Pregnancy profile and trimester target updated!",
            "profile": updated
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500
