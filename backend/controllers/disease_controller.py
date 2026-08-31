from flask import jsonify, request, g
from models.Disease import Disease
from models.Yoga import Yoga

def get_diseases_list():
    """Retrieve all disease guides with optional search filtering."""
    try:
        search = request.args.get('search', '').strip()
        diseases = Disease.get_all(search)
        
        # Format IDs
        for item in diseases:
            item['_id'] = str(item['_id'])
            
        return jsonify({"diseases": diseases}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_disease_by_name(name):
    """Retrieve detailed guide for a single disease."""
    try:
        disease = Disease.find_by_name(name)
        if not disease:
            return jsonify({"message": f"Disease guide for '{name}' not found."}), 404
            
        disease['_id'] = str(disease['_id'])
        return jsonify({"disease": disease}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_yogas_list():
    """Retrieve yoga list with search or disease filter."""
    try:
        search = request.args.get('search', '').strip()
        disease_filter = request.args.get('disease', '').strip()
        
        if disease_filter:
            yogas = Yoga.get_by_disease(disease_filter)
        else:
            yogas = Yoga.get_all(search)
            
        for item in yogas:
            item['_id'] = str(item['_id'])
            
        return jsonify({"yogas": yogas}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_medicine_suggestions_education():
    """Display medicine categories for educational purposes only. Always show disclaimer."""
    disclaimer = "Consult a qualified healthcare professional before taking any medicine."
    
    categories = [
        {
            "category": "Antidiabetic Medications",
            "usage": "Used to control blood glucose levels in diabetes mellitus.",
            "examples": ["Metformin (Glucophage)", "Glipizide (Sulfonylurea)", "Empagliflozin (Jardiance)", "Insulin (Lantus/Humalog)"],
            "education_note": "Essential for Type 1 and Type 2 diabetes. Often paired with lifestyle modifications like low-carb diets.",
            "associated_diseases": ["Diabetes"]
        },
        {
            "category": "Antihypertensive Medications",
            "usage": "Used to lower blood pressure and prevent cardiovascular issues.",
            "examples": ["Lisinopril (ACE Inhibitor)", "Amlodipine (Calcium Channel Blocker)", "Losartan (ARB)", "Metoprolol (Beta-blocker)"],
            "education_note": "Regular monitoring is key to prevent hypotension (excessively low blood pressure) and kidney strain.",
            "associated_diseases": ["Hypertension", "Cardiovascular / Coronary Artery Disease (CAD)"]
        },
        {
            "category": "Weight Management Medications",
            "usage": "Used to assist with weight reduction in clinical obesity.",
            "examples": ["Semaglutide (Wegovy/Ozempic)", "Orlistat (Alli/Xenical)", "Phentermine-Topiramate (Qsymia)"],
            "education_note": "These work by reducing appetite or blocking fat absorption. Most effective when combined with calorie restriction and physical exercise.",
            "associated_diseases": ["Obesity"]
        },
        {
            "category": "Hormonal & Insulin Sensitizers",
            "usage": "Used to regulate menstrual cycles and manage insulin resistance in PCOS.",
            "examples": ["Combined Oral Contraceptives", "Spironolactone (Anti-androgen)", "Metformin (Off-label for insulin resistance)"],
            "education_note": "Helps reduce symptoms like hirsutism, acne, and irregular periods. Spironolactone requires monitoring of potassium levels.",
            "associated_diseases": ["PCOS", "PCOD"]
        },
        {
            "category": "Thyroid Hormone Replacements",
            "usage": "Used to treat underactive thyroid (hypothyroidism).",
            "examples": ["Levothyroxine (Synthroid)", "Liothyronine (Cytomel)"],
            "education_note": "Should be taken in the morning on an empty stomach, at least 30-60 minutes before breakfast, coffee, or other supplements.",
            "associated_diseases": ["Thyroid (Hypothyroidism)"]
        },
        {
            "category": "Antithyroid Agents",
            "usage": "Used to treat overactive thyroid (hyperthyroidism).",
            "examples": ["Methimazole (Tapazole)", "Propylthiouracil (PTU)", "Propranolol (Beta-blocker for symptom management)"],
            "education_note": "These inhibit the production of thyroid hormones. Beta-blockers are often co-prescribed to rapidly control tremors and rapid heart rate.",
            "associated_diseases": ["Thyroid (Hyperthyroidism)"]
        },
        {
            "category": "Bronchodilators & Inhaled Corticosteroids",
            "usage": "Used to dilate airways and control chronic inflammation in Asthma & COPD.",
            "examples": ["Albuterol (ProAir - Rescue Inhaler)", "Fluticasone (Flovent - Controller)", "Budesonide/Formoterol (Symbicort - Combination)"],
            "education_note": "Rescue inhalers are for quick relief during an attack. Controller inhalers must be used daily as prescribed to prevent attacks.",
            "associated_diseases": ["Asthma & COPD"]
        },
        {
            "category": "Acid Reducers (PPIs & H2 Blockers)",
            "usage": "Used to reduce stomach acid production and treat GERD/Acid Reflux.",
            "examples": ["Omeprazole (Prilosec - PPI)", "Famotidine (Pepcid - H2 Blocker)", "Calcium Carbonate (Tums - Antacid)"],
            "education_note": "PPIs are most effective when taken 30 minutes before the first meal of the day. Long-term use requires monitoring of B12 and calcium levels.",
            "associated_diseases": ["GERD (Acid Reflux)"]
        },
        {
            "category": "Gastrointestinal Antispasmodics & Motility Regulators",
            "usage": "Used to manage bowel spasms, abdominal cramping, and stool consistency in IBS.",
            "examples": ["Dicyclomine (Bentyl)", "Loperamide (Imodium - for diarrhea)", "Psyllium Husk (Metamucil - fiber supplement)"],
            "education_note": "Treatments are highly symptom-specific. Spasm reducers are usually taken before meals to prevent postprandial cramping.",
            "associated_diseases": ["Irritable Bowel Syndrome (IBS)"]
        },
        {
            "category": "Uric Acid-Lowering & Antigout Agents",
            "usage": "Used to prevent gout flares and lower serum uric acid levels.",
            "examples": ["Allopurinol (Zyloprim - preventive)", "Colchicine (Colcrys - acute flare)", "Indomethacin (NSAID for pain)"],
            "education_note": "Allopurinol is taken daily to keep uric acid levels low and prevent joint damage. Colchicine is used at the very first sign of a flare.",
            "associated_diseases": ["Gout (High Uric Acid)"]
        },
        {
            "category": "Phosphate Binders & Electrolyte Regulators",
            "usage": "Used to manage phosphorus and mineral levels in Chronic Kidney Disease.",
            "examples": ["Sevelamer Carbonate (Renvela)", "Calcium Acetate (PhosLo)", "Sodium Polystyrene Sulfonate (for high potassium)"],
            "education_note": "Phosphate binders must be taken with meals to bind dietary phosphorus in the gut, preventing bone and vascular complications.",
            "associated_diseases": ["Chronic Kidney Disease (CKD)"]
        },
        {
            "category": "Iron & Hemoglobin Supplements",
            "usage": "Used to correct dietary and absorption-related iron deficiency anemia.",
            "examples": ["Ferrous Sulfate", "Ferrous Gluconate", "Iron Carbonyl"],
            "education_note": "Taking iron supplements with Vitamin C (e.g. orange juice) significantly boosts absorption. Avoid taking them with milk, antacids, or tea.",
            "associated_diseases": ["Iron Deficiency Anemia"]
        },
        {
            "category": "Hepatoprotectants & Lipophilic Vitamins",
            "usage": "Used to reduce liver inflammation and support cell health in Fatty Liver Disease (NAFLD).",
            "examples": ["Vitamin E (Antioxidant)", "Ursodeoxycholic Acid (UDCA)", "Omega-3 Fatty Acids (Lovaza)"],
            "education_note": "Currently, weight loss is the primary treatment for NAFLD, but high-dose antioxidants and omega-3s are used to reduce inflammation and triglycerides.",
            "associated_diseases": ["Fatty Liver Disease (NAFLD)"]
        },
        {
            "category": "NSAIDs & DMARDs",
            "usage": "Used to treat joint pain, swelling, and arrest autoimmune joint destruction in Arthritis.",
            "examples": ["Celecoxib (Celebrex - NSAID)", "Methotrexate (DMARD for RA)", "Ibuprofen (Advil/Motrin - pain relief)"],
            "education_note": "NSAIDs manage symptoms but do not stop disease progression. DMARDs are crucial in rheumatoid arthritis to prevent long-term joint deformity.",
            "associated_diseases": ["Arthritis (Osteo & Rheumatoid)"]
        },
        {
            "category": "Bone-Building Agents & Calcium Regulators",
            "usage": "Used to increase bone mineral density and reduce fracture risk in Osteoporosis.",
            "examples": ["Alendronate (Fosamax - Bisphosphonate)", "Zoledronic Acid (Reclast - IV)", "Calcium Carbonate + Vitamin D3 (supplements)"],
            "education_note": "Oral bisphosphonates like Alendronate must be taken first thing in the morning with a full glass of water, and you must remain upright for 30 minutes.",
            "associated_diseases": ["Osteoporosis"]
        },
        {
            "category": "Migraine Abortive & Preventive Medications",
            "usage": "Used to stop an active migraine attack and reduce the frequency of chronic headaches.",
            "examples": ["Sumatriptan (Imitrex - Abortive)", "Rizatriptan (Maxalt - Abortive)", "Topiramate (Topamax - Preventive)", "Propranolol (Beta-blocker - Preventive)"],
            "education_note": "Abortive triptans should be taken as soon as the aura or pain starts. Limit abortive use to <10 days a month to avoid medication overuse headaches.",
            "associated_diseases": ["Migraine & Headaches"]
        },
        {
            "category": "Nutrient Replacements for Malabsorption",
            "usage": "Used to replace essential vitamins and minerals depleted due to intestinal damage in Celiac Disease.",
            "examples": ["Gluten-free Multivitamins", "Methylcobalamin (B12 injection/sublingual)", "Folic Acid", "Calcium Citrate"],
            "education_note": "Strict lifetime adherence to a gluten-free diet is the only treatment. Supplements are critical in the early phases to heal mucosal damage.",
            "associated_diseases": ["Celiac Disease"]
        },
        {
            "category": "Antiplatelets & Angina Medications",
            "usage": "Used to prevent blood clots and treat chest pain in Coronary Artery Disease.",
            "examples": ["Aspirin (Low-dose antiplatelet)", "Clopidogrel (Plavix - Antiplatelet)", "Nitroglycerin (Sublingual vaso-dilator)", "Metoprolol (Beta-blocker)"],
            "education_note": "Aspirin prevents heart attacks by keeping platelets from sticking. Nitroglycerin is used under the tongue for acute chest pain.",
            "associated_diseases": ["Cardiovascular / Coronary Artery Disease (CAD)"]
        },
        {
            "category": "Antidepressants & Anxiolytics",
            "usage": "Used to regulate neurotransmitters, alleviate depression, and manage severe anxiety.",
            "examples": ["Sertraline (Zoloft - SSRI)", "Escitalopram (Lexapro - SSRI)", "Duloxetine (Cymbalta - SNRI)", "Alprazolam (Xanax - Benzodiazepine for short term)"],
            "education_note": "SSRIs and SNRIs take 4-6 weeks of daily usage to become fully effective. Benzodiazepines work immediately but carry risks of dependency.",
            "associated_diseases": ["Anxiety & Depression", "Chronic Insomnia"]
        },
        {
            "category": "Sedative-Hypnotics & Melatonin Receptor Agonists",
            "usage": "Used to induce sleep and regulate sleep cycles in Chronic Insomnia.",
            "examples": ["Zolpidem (Ambien)", "Eszopiclone (Lunesta)", "Melatonin (Over-the-counter hormone)", "Ramelteon (Rozerem)"],
            "education_note": "Prescription sleeping pills are generally recommended for short-term use (2-4 weeks) alongside Cognitive Behavioral Therapy for Insomnia (CBT-I).",
            "associated_diseases": ["Chronic Insomnia", "Anxiety & Depression"]
        }
    ]
    
    return jsonify({
        "disclaimer": disclaimer,
        "categories": categories
    }), 200

def toggle_yoga_favorite():
    """Toggle a yoga pose in user's favorites list."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        pose_id = data.get('pose_id')
        if not pose_id:
            return jsonify({"message": "Pose ID is required"}), 400
        
        from models.YogaProgress import YogaProgress
        favorites, action = YogaProgress.toggle_favorite(user_id, pose_id)
        return jsonify({
            "message": f"Pose {action} favorites successfully",
            "favorites": favorites
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def complete_yoga_pose():
    """Mark a yoga pose as completed, update streak, sync listening metrics, and log to DailyTracker."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        pose_id = data.get('pose_id')
        pose_name = data.get('pose_name')
        duration_sec = data.get('duration_sec', 0)
        calories_burned = data.get('calories_burned', 0.0)
        listened_sec = data.get('listened_sec', 0)
        completed_listening = data.get('completed_listening', False)
        
        if not pose_id or not pose_name:
            return jsonify({"message": "Pose ID and name are required"}), 400
            
        from models.YogaProgress import YogaProgress
        result = YogaProgress.complete_pose(
            user_id, pose_id, pose_name, duration_sec, calories_burned,
            listened_sec=listened_sec, completed_listening=completed_listening
        )
        return jsonify({
            "message": "Yoga pose marked completed successfully",
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def update_listening_progress():
    """Save standalone listening progress for a pose audio guide."""
    try:
        user_id = g.user_id
        data = request.get_json() or {}
        pose_id = data.get('pose_id')
        listened_sec = data.get('listened_sec', 0)
        total_sec = data.get('total_sec', 0)
        completed_listening = data.get('completed_listening', False)
        
        if not pose_id:
            return jsonify({"message": "Pose ID is required"}), 400
            
        from models.YogaProgress import YogaProgress
        result = YogaProgress.update_listening(user_id, pose_id, listened_sec, total_sec, completed_listening)
        return jsonify({
            "message": "Listening progress updated successfully",
            "listening_progress": result
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500


def get_yoga_progress():
    """Retrieve user's favorite yoga poses and completed sessions/streaks."""
    try:
        user_id = g.user_id
        from models.YogaProgress import YogaProgress
        progress = YogaProgress.find_or_create_progress(user_id)
        
        # Convert ObjectIds to strings
        progress['_id'] = str(progress['_id'])
        progress['user_id'] = str(progress['user_id'])
        
        return jsonify({"progress": progress}), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_yoga_daily_plan():
    """Generate a personalized daily plan based on user diseases, age, BMI, and goals."""
    try:
        import datetime
        user = g.user
        user_id = g.user_id
        
        # Extract profile info
        age = user.get('age')
        gender = user.get('gender')
        bmi = user.get('bmi')
        diseases = user.get('diseases', [])
        goal = user.get('goal', '')
        
        # Fetch all poses
        from models.Yoga import Yoga
        all_poses = Yoga.get_all()
        
        # Standardize lists of user diseases/goals
        user_conditions = [d.lower().strip() for d in diseases]
        user_goal = goal.lower().strip() if goal else ""
        
        # Filter out poses that user must avoid
        safe_poses = []
        for pose in all_poses:
            avoid = False
            # If any disease matches an item in the avoid_if list, filter it out
            for cond in pose.get('avoid_if', []):
                if cond.lower().strip() in user_conditions:
                    avoid = True
                    break
            if not avoid:
                # Convert ObjectIds
                pose['_id'] = str(pose['_id'])
                safe_poses.append(pose)
        
        # Select poses based on categories
        warmups = [p for p in safe_poses if any("Beginner" in cat or "Neck" in cat or "Back" in cat for cat in p.get('category', []))]
        meditations = [p for p in safe_poses if "Meditation" in p.get('category', [])]
        pranayamas = [p for p in safe_poses if "Breathing Exercises (Pranayama)" in p.get('category', [])]
        
        # Select Core poses based on user conditions
        core_poses = []
        for pose in safe_poses:
            is_suitable = False
            for cond in pose.get('suitable_diseases', []):
                if cond.lower().strip() in user_conditions:
                    is_suitable = True
                    break
            
            if not is_suitable and user_goal:
                for cat in pose.get('category', []):
                    if user_goal in cat.lower():
                        is_suitable = True
                        break
                        
            if is_suitable and pose not in core_poses and pose not in meditations and pose not in pranayamas:
                core_poses.append(pose)
                
        # Fallback core poses if none match
        if not core_poses:
            core_poses = [p for p in safe_poses if p not in meditations and p not in pranayamas][:3]
        else:
            core_poses = core_poses[:4]
            
        # Construct sequence
        sequence = []
        
        # 1. Warm-up (5 min)
        warmup_pose = warmups[0] if warmups else None
        if warmup_pose:
            sequence.append({
                **warmup_pose,
                "routine_role": "Warm-up",
                "routine_duration": "5 minutes"
            })
            
        # 2. Core poses
        for idx, core in enumerate(core_poses):
            sequence.append({
                **core,
                "routine_role": f"Focus Pose {idx+1}",
                "routine_duration": f"{core.get('duration_sec', 60)} seconds"
            })
            
        # 3. Pranayama
        pranayama_pose = pranayamas[0] if pranayamas else None
        if pranayama_pose:
            sequence.append({
                **pranayama_pose,
                "routine_role": "Breathing",
                "routine_duration": "5 minutes"
            })
            
        # 4. Meditation
        meditation_pose = meditations[0] if meditations else None
        if meditation_pose:
            sequence.append({
                **meditation_pose,
                "routine_role": "Meditation",
                "routine_duration": "5 minutes"
            })
            
        # 5. Cool down / Shavasana
        shavasana_pose = next((p for p in safe_poses if p.get('sanskrit_name') == "Shavasana"), None)
        if shavasana_pose:
            sequence.append({
                **shavasana_pose,
                "routine_role": "Relaxation",
                "routine_duration": "5 minutes"
            })
            
        # Calculate total duration in minutes
        total_duration_sec = 0
        for p in sequence:
            role = p["routine_role"]
            if role in ["Warm-up", "Breathing", "Meditation", "Relaxation"]:
                total_duration_sec += 300  # 5 mins
            else:
                total_duration_sec += p.get('duration_sec', 60) * p.get('repetitions', 1)
                
        total_duration_mins = int(total_duration_sec / 60)
        total_calories = sum(p.get('calories_burned', 0.0) for p in sequence)
        
        # Fetch progress to see what is completed today
        from models.YogaProgress import YogaProgress
        progress = YogaProgress.find_or_create_progress(user_id)
        today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        completed_today_ids = [s['pose_id'] for s in progress.get('completed_sessions', []) if s['date'] == today_str]
        
        return jsonify({
            "plan": {
                "date": today_str,
                "sequence": sequence,
                "total_duration_mins": total_duration_mins,
                "total_calories": round(total_calories, 1),
                "completed_today_ids": completed_today_ids
            }
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_yoga_weekly_challenge():
    """Evaluate challenge progress over last 7 days and unlock badges."""
    try:
        import datetime
        user_id = g.user_id
        from models.YogaProgress import YogaProgress
        progress = YogaProgress.find_or_create_progress(user_id)
        completed = progress.get('completed_sessions', [])
        
        today = datetime.datetime.utcnow()
        challenge_days = []
        completed_dates = {s['date'] for s in completed}
        
        total_completed = 0
        for i in range(6, -1, -1):
            day_date = today - datetime.timedelta(days=i)
            date_str = day_date.strftime("%Y-%m-%d")
            is_completed = date_str in completed_dates
            if is_completed:
                total_completed += 1
            challenge_days.append({
                "day_index": 7 - i,
                "day_name": day_date.strftime("%a"),
                "date": date_str,
                "completed": is_completed
            })
            
        completion_percentage = int((total_completed / 7) * 100)
        
        badges = []
        total_sessions = len(completed)
        streak = progress.get('streak', 0)
        
        badges.append({
            "id": "bronze",
            "title": "Bronze Yogi",
            "description": "Completed your first yoga pose!",
            "icon": "🥉",
            "unlocked": total_sessions >= 1
        })
            
        badges.append({
            "id": "silver",
            "title": "Silver Yogi",
            "description": "Completed 3 yoga sessions!",
            "icon": "🥈",
            "unlocked": total_sessions >= 3
        })
            
        badges.append({
            "id": "gold",
            "title": "Gold Yogi",
            "description": "Completed 7 yoga sessions!",
            "icon": "🥇",
            "unlocked": total_sessions >= 7
        })
            
        badges.append({
            "id": "streak_3",
            "title": "Streak Master",
            "description": "Maintain a 3-day practice streak!",
            "icon": "🔥",
            "unlocked": streak >= 3
        })
            
        zen_count = sum(1 for s in completed if any(x in s['pose_name'].lower() for x in ["meditation", "breathing", "vilom"]))
        badges.append({
            "id": "zen",
            "title": "Zen Master",
            "description": "Completed 3 mindfulness meditation or pranayama sessions!",
            "icon": "🧘",
            "unlocked": zen_count >= 3
        })
            
        return jsonify({
            "challenge": {
                "days": challenge_days,
                "completion_percentage": completion_percentage,
                "streak": streak,
                "badges": badges
            }
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

def get_yoga_analytics():
    """Gather yoga sessions and aggregate stats for chart visualizers."""
    try:
        import datetime
        user_id = g.user_id
        from models.YogaProgress import YogaProgress
        progress = YogaProgress.find_or_create_progress(user_id)
        completed = progress.get('completed_sessions', [])
        
        total_sessions = len(completed)
        total_time_mins = sum(s.get('duration_sec', 0) for s in completed) // 60
        total_calories = round(sum(s.get('calories_burned', 0.0) for s in completed), 1)
        
        today = datetime.datetime.utcnow()
        weekly_trend = []
        completed_by_date = {}
        for s in completed:
            d = s['date']
            completed_by_date[d] = completed_by_date.get(d, 0) + 1
              
        for i in range(6, -1, -1):
            day_date = today - datetime.timedelta(days=i)
            date_str = day_date.strftime("%Y-%m-%d")
            weekly_trend.append({
                "label": day_date.strftime("%a"),
                "date": date_str,
                "sessions": completed_by_date.get(date_str, 0)
            })
              
        monthly_trend = []
        for w in range(3, -1, -1):
            start_day = today - datetime.timedelta(days=(w+1)*7)
            end_day = today - datetime.timedelta(days=w*7)
            count = 0
            for s in completed:
                try:
                    s_date = datetime.datetime.strptime(s['date'], "%Y-%m-%d")
                    if start_day <= s_date < end_day:
                        count += 1
                except Exception:
                    pass
            monthly_trend.append({
                "label": f"Week {4-w}",
                "sessions": count
            })
              
        insights = []
        user = g.user
        diseases = [d.lower() for d in user.get('diseases', [])]
        
        if not completed:
            insights.append("Start practicing to unlock health insights!")
        else:
            pose_names = [s['pose_name'].lower() for s in completed]
            
            if any(any(x in p for x in ["meditation", "vilom", "shavasana"]) for p in pose_names):
                insights.append("Your regular breathing and relaxation practice is helping calm your sympathetic nervous system, directly improving stress markers and lowering blood pressure.")
                  
            if any(any(x in p for x in ["butterfly", "cobra"]) for p in pose_names) and any(x in diseases for x in ["pcos", "pcod"]):
                insights.append("Regularly practicing Baddha Konasana (Butterfly) and Bhujangasana (Cobra) improves pelvic blood flow, helping regulate hormones and alleviate ovarian congestion in PCOS.")
                  
            if any(any(x in p for x in ["mandukasana", "vajrasana"]) for p in pose_names) and "diabetes" in diseases:
                insights.append("By practicing Mandukasana, you are gently compressing the abdominal area to stimulate pancreatic islet cells, aiding in insulin regulation and postprandial glucose management.")
                  
            if any(any(x in p for x in ["plank", "warrior", "sun salutation"]) for p in pose_names):
                insights.append("Strengthening poses are increasing your lean muscle mass and boosting basal metabolic rate, which accelerates fat loss and improves glucose uptake.")
                  
            if any(any(x in p for x in ["cat cow", "bridge", "cobra"]) for p in pose_names) and "back pain" in diseases:
                insights.append("Spinal traction exercises are strengthening your deep core stabilizer muscles and spinal extensors, aiding in postural alignment and back pain relief.")
                  
            if len(insights) < 2:
                insights.append("Consistent practice of dynamic yoga poses helps enhance joint flexibility, cardiovascular endurance, and body-mind harmony.")
                  
        return jsonify({
            "analytics": {
                "total_sessions": total_sessions,
                "total_time_mins": total_time_mins,
                "total_calories": total_calories,
                "streak": progress.get('streak', 0),
                "weekly_trend": weekly_trend,
                "monthly_trend": monthly_trend,
                "insights": insights
            }
        }), 200
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

