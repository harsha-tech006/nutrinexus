from bson import ObjectId
from database.db import get_db

class Yoga:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['yogas']

    @classmethod
    def get_all(cls, search=""):
        collection = cls.get_collection()
        try:
            if collection.count_documents({}) == 0:
                cls.seed_data()
        except Exception:
            pass
        if search:
            query = {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"sanskrit_name": {"$regex": search, "$options": "i"}},
                    {"suitable_diseases": {"$regex": search, "$options": "i"}},
                    {"muscles_targeted": {"$regex": search, "$options": "i"}},
                    {"difficulty": {"$regex": search, "$options": "i"}},
                    {"category": {"$regex": search, "$options": "i"}}
                ]
            }
            return list(collection.find(query))
        return list(collection.find({}))

    @classmethod
    def get_by_disease(cls, disease_name):
        collection = cls.get_collection()
        try:
            if collection.count_documents({}) == 0:
                cls.seed_data()
        except Exception:
            pass
            
        if not disease_name or disease_name.strip() == '':
            return list(collection.find({}))
            
        clean_name = disease_name.strip()
        query = {
            "$or": [
                {"suitable_diseases": {"$regex": clean_name, "$options": "i"}},
                {"category": {"$regex": clean_name, "$options": "i"}},
                {"name": {"$regex": clean_name, "$options": "i"}},
                {"sanskrit_name": {"$regex": clean_name, "$options": "i"}},
                {"short_description": {"$regex": clean_name, "$options": "i"}},
                {"benefits": {"$regex": clean_name, "$options": "i"}}
            ]
        }
        results = list(collection.find(query))
        
        # If no specific pose matches the regex keyword, return general restorative poses so list is never empty
        if not results or len(results) == 0:
            results = list(collection.find({
                "$or": [
                    {"category": {"$regex": "Beginner|Flexibility|Stress|Digestive", "$options": "i"}},
                    {"difficulty": "Beginner"}
                ]
            }))[:6]
            
        if not results:
            results = list(collection.find({}))[:6]
            
        return results

    @classmethod
    def find_by_id(cls, yoga_id):
        if isinstance(yoga_id, str):
            yoga_id = ObjectId(yoga_id)
        return cls.get_collection().find_one({"_id": yoga_id})

    @classmethod
    def create(cls, data):
        collection = cls.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @classmethod
    def seed_data(cls):
        """Seed database with all 45 major requested yoga poses."""
        collection = cls.get_collection()

        yogas = [
            {
                "name": "Surya Namaskar",
                "sanskrit_name": "Surya Namaskar",
                "short_description": "A dynamic sequence of 12 powerful yoga postures that forms a complete cardiovascular workout.",
                "category": ["Weight Loss", "Diabetes", "PCOS", "PCOD", "Flexibility", "Strength", "Morning Yoga"],
                "difficulty": "Intermediate",
                "duration_sec": 60,
                "repetitions": 5,
                "calories_burned": 70.0,
                "benefits": [
                    "Improves blood circulation throughout the body",
                    "Strengthens muscles, joints, and improves posture",
                    "Helps in weight loss and hormone balancing"
                ],
                "step_by_step_instructions": [
                    "Pranamasana (Prayer Pose): Stand with feet together and palms at chest.",
                    "Hasta Uttanasana: Inhale, raise arms and stretch backward.",
                    "Padahastasana: Exhale, bend forward to touch feet.",
                    "Ashwa Sanchalanasana: Inhale, push right leg back, look up.",
                    "Dandasana (Plank): Hold breath, bring left leg back, keep body straight.",
                    "Ashtanga Namaskara: Exhale, drop knees, chest, and chin.",
                    "Bhujangasana: Inhale, arch chest up into cobra.",
                    "Adho Mukha Svanasana: Exhale, lift hips up into downward dog.",
                    "Ashwa Sanchalanasana: Inhale, bring right foot forward.",
                    "Padahastasana: Exhale, bring left foot forward.",
                    "Hasta Uttanasana: Inhale, raise arms and stretch back.",
                    "Pranamasana: Exhale, stand straight in prayer."
                ],
                "breathing_instructions": [
                    "Inhale during expansions (Hasta Uttanasana, Ashwa Sanchalanasana, Bhujangasana).",
                    "Exhale during contractions (Padahastasana, Ashtanga Namaskara, Adho Mukha Svanasana)."
                ],
                "common_mistakes": ["Rushing through steps", "Holding breath instead of matching to pose"],
                "safety_precautions": ["Engage your core to protect lower back", "Bend knees if hamstrings are tight"],
                "avoid_if": ["Pregnancy", "Severe Hypertension", "Heart Disease", "Hernia"],
                "muscles_targeted": ["Core", "Hamstrings", "Back", "Shoulders", "Chest"],
                "suitable_diseases": ["Obesity", "Diabetes", "PCOS", "Hypothyroidism"],
                "imageUrl": "/assets/yoga/surya_namaskar.jpg"
            },
            {
                "name": "Mountain Pose",
                "sanskrit_name": "Tadasana",
                "short_description": "The base standing posture that improves physical balance, posture, and mental focus.",
                "category": ["Beginner Yoga", "Senior Yoga", "Office Yoga", "Flexibility", "Post Pregnancy"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 3,
                "calories_burned": 8.0,
                "benefits": [
                    "Improves posture and body alignment",
                    "Strengthens thighs, knees, and ankles",
                    "Helps reduce flat feet discomfort"
                ],
                "step_by_step_instructions": [
                    "Stand straight with big toes touching, heels slightly apart.",
                    "Inhale, raise your arms overhead, interlock your fingers, and turn palms upward.",
                    "Exhale, stretch up and lift your heels, balancing on your toes.",
                    "Hold for 20 seconds, breathing normally. Lower heels and repeat."
                ],
                "breathing_instructions": [
                    "Inhale as you raise your arms and lift your heels.",
                    "Breathe evenly while holding the stretch."
                ],
                "common_mistakes": ["Locking knees completely", "Arching lower back too much"],
                "safety_precautions": ["Keep heels flat if balancing is difficult", "Stand near a wall for balance support"],
                "avoid_if": ["Vertigo", "Low Blood Pressure", "Severe Headache"],
                "muscles_targeted": ["Calves", "Quads", "Ankles", "Spine"],
                "suitable_diseases": ["Postural Defects", "Flat Feet"],
                "imageUrl": "/assets/yoga/tadasana.jpg"
            },
            {
                "name": "Tree Pose",
                "sanskrit_name": "Vrikshasana",
                "short_description": "A classic standing balance pose that strengthens the legs and focuses the mind.",
                "category": ["Beginner Yoga", "Senior Yoga", "Stress Relief", "Anxiety", "Flexibility"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 10.0,
                "benefits": [
                    "Improves neuromuscular coordination and physical balance",
                    "Strengthens tendons and ligaments of the feet and knees",
                    "Calms the mind and improves concentration"
                ],
                "step_by_step_instructions": [
                    "Stand straight. Shift weight to left leg, bend right knee, and place right foot high on inner left thigh.",
                    "Bring palms together at chest in prayer position.",
                    "Inhale, extend arms overhead. Hold for 30 seconds. Repeat on other side."
                ],
                "breathing_instructions": [
                    "Inhale while raising hands overhead.",
                    "Maintain slow, deep, rhythmic breathing to aid balance."
                ],
                "common_mistakes": ["Placing foot directly on side of knee joint", "Allowing hips to swing outward"],
                "safety_precautions": ["Place foot on calf instead of thigh if needed, never on knee joint"],
                "avoid_if": ["Vertigo", "Migraine", "High Blood Pressure"],
                "muscles_targeted": ["Quads", "Ankles", "Adductors", "Core"],
                "suitable_diseases": ["Sciatica", "Stress", "Anxiety"],
                "imageUrl": "/assets/yoga/vrikshasana.jpg"
            },
            {
                "name": "Triangle Pose",
                "sanskrit_name": "Trikonasana",
                "short_description": "A standing lateral stretch pose that tones the abdominal muscles and stretches the spine.",
                "category": ["Beginner Yoga", "Weight Loss", "Flexibility", "Constipation", "Digestive Health"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 18.0,
                "benefits": [
                    "Stretches and strengthens thighs, knees, and ankles",
                    "Stimulates abdominal organs, aiding digestion and bowel movement",
                    "Relieves backache and neck stiffness"
                ],
                "step_by_step_instructions": [
                    "Stand with feet 3-4 feet apart. Turn right foot out 90 degrees.",
                    "Inhale, extend arms to sides parallel to floor.",
                    "Exhale, bend torso right, reaching right hand to shin or floor. Extend left arm up.",
                    "Hold for 30 seconds, gaze at left thumb. Repeat on other side."
                ],
                "breathing_instructions": [
                    "Inhale while stretching arms out.",
                    "Exhale as you bend sideways into the pose.",
                    "Breathe slowly and deeply while holding."
                ],
                "common_mistakes": ["Leaning forward instead of keeping torso aligned sideways", "Hyperextending front knee"],
                "safety_precautions": ["Rest hand on shin/block rather than floor if hamstring is tight"],
                "avoid_if": ["Low Blood Pressure", "Diarrhea", "Migraine", "Spine Injury"],
                "muscles_targeted": ["Hamstrings", "Obliques", "Hips", "Shoulders", "Chest"],
                "suitable_diseases": ["Constipation", "Indigestion", "Back Pain"],
                "imageUrl": "/assets/yoga/trikonasana.jpg"
            },
            {
                "name": "Cobra Pose",
                "sanskrit_name": "Bhujangasana",
                "short_description": "A classic backbend that increases spine flexibility, tones the abdomen, and stimulates the pancreas.",
                "category": ["Beginner Yoga", "Diabetes", "PCOS", "PCOD", "Back Pain", "Stress Relief"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 3,
                "calories_burned": 12.0,
                "benefits": [
                    "Improves spinal flexibility and strengthens shoulders",
                    "Stimulates pancreatic cells to regulate insulin secretion",
                    "Relieves stress and regulates menstrual cycle in PCOS/PCOD"
                ],
                "step_by_step_instructions": [
                    "Lie on stomach with feet together, hands under shoulders, elbows close to sides.",
                    "Inhale, slowly lift your chest off the floor, keeping your navel close to the ground.",
                    "Roll shoulders back and keep neck long. Hold for 15-30 seconds. Exhale, return down."
                ],
                "breathing_instructions": [
                    "Inhale as you raise your chest and upper body.",
                    "Hold pose with normal, steady breathing.",
                    "Exhale as you gently release the pose and lower down."
                ],
                "common_mistakes": ["Locking elbows straight", "Shrugging shoulders into ears", "Over-arching lower back"],
                "safety_precautions": ["Keep elbows slightly bent and shoulders down. Do not force high arch."],
                "avoid_if": ["Pregnancy", "Severe Back Injury", "Recent Abdominal Surgery", "Hernia"],
                "muscles_targeted": ["Erector Spinae", "Shoulders", "Triceps", "Abdominals"],
                "suitable_diseases": ["Diabetes", "PCOS", "PCOD", "Back Pain", "Stress"],
                "imageUrl": "/assets/yoga/bhujangasana.jpg"
            },
            {
                "name": "Downward Facing Dog",
                "sanskrit_name": "Adho Mukha Svanasana",
                "short_description": "An inversion posture that rejuvenates the body, stretches hamstrings, and improves heart circulation.",
                "category": ["Beginner Yoga", "Heart Health", "Stress Relief", "Anxiety", "Flexibility", "Strength"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 2,
                "calories_burned": 15.0,
                "benefits": [
                    "Improves blood flow to the brain and heart",
                    "Stretches hamstrings, calves, shoulders, and hands",
                    "Relieves stress, fatigue, and mild depression"
                ],
                "step_by_step_instructions": [
                    "Start on hands and knees. Tuck toes, exhale, and lift knees off floor, pushing hips upward.",
                    "Straighten legs, press heels toward mat, forming an inverted 'V' shape.",
                    "Relax neck, look between feet, hold for 30-60 seconds."
                ],
                "breathing_instructions": [
                    "Exhale as you lift your hips and press back.",
                    "Maintain deep abdominal breathing while holding the pose."
                ],
                "common_mistakes": ["Rounding the lower back", "Keeping shoulders tense and close to neck"],
                "safety_precautions": ["Bend knees slightly if hamstrings or calves are tight to keep spine long"],
                "avoid_if": ["Carpal Tunnel Syndrome", "High Blood Pressure", "Late-term Pregnancy", "Glaucoma"],
                "muscles_targeted": ["Hamstrings", "Calves", "Latissimus Dorsi", "Shoulders", "Core"],
                "suitable_diseases": ["Hypertension", "Anxiety", "Stress", "Fatigue"],
                "imageUrl": "/assets/yoga/adho_mukha_svanasana.jpg"
            },
            {
                "name": "Warrior I Pose",
                "sanskrit_name": "Virabhadrasana I",
                "short_description": "A powerful standing posture that builds leg stamina, core stability, and stretches the chest.",
                "category": ["Beginner Yoga", "Weight Loss", "Strength", "Flexibility", "Morning Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 25.0,
                "benefits": [
                    "Strengthens legs, ankles, shoulders, and back",
                    "Stretches the chest, lungs, and groin",
                    "Improves body balance and focus"
                ],
                "step_by_step_instructions": [
                    "Stand straight. Step right foot back 3-4 feet. Turn right foot in slightly.",
                    "Bend left knee to a 90-degree angle directly over left ankle.",
                    "Inhale, raise arms overhead, palms facing. Arch upper back slightly. Hold for 30-45 seconds."
                ],
                "breathing_instructions": [
                    "Inhale while raising arms overhead and lengthening spine.",
                    "Exhale as you sink hips deeper into the lunge."
                ],
                "common_mistakes": ["Allowing front knee to slide past ankle", "Allowing back knee to sag"],
                "safety_precautions": ["Keep hips squared forward. Keep back leg active and heel pressed down."],
                "avoid_if": ["High Blood Pressure", "Recent Knee or Shoulder Injury", "Heart Conditions"],
                "muscles_targeted": ["Quads", "Glutes", "Psoas", "Shoulders", "Chest"],
                "suitable_diseases": ["Obesity", "Postural Defects"],
                "imageUrl": "/assets/yoga/virabhadrasana_i.jpg"
            },
            {
                "name": "Warrior II Pose",
                "sanskrit_name": "Virabhadrasana II",
                "short_description": "A chest-opening standing pose that enhances hip mobility, stamina, and concentration.",
                "category": ["Beginner Yoga", "Weight Loss", "Strength", "Flexibility", "Office Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 25.0,
                "benefits": [
                    "Stretches hips, inner thighs, groin, and chest",
                    "Builds stamina and strengthens legs and ankles",
                    "Tones abdominal muscles and reduces fat"
                ],
                "step_by_step_instructions": [
                    "Stand with feet 3-4 feet apart. Turn right foot out 90 degrees, left foot in slightly.",
                    "Inhale, raise arms parallel to floor. Exhale, bend right knee over right ankle.",
                    "Turn head to right, gaze over right fingers. Hold for 45 seconds. Repeat on left side."
                ],
                "breathing_instructions": [
                    "Inhale as you raise your arms.",
                    "Exhale as you bend your front knee and sink down.",
                    "Breathe slowly while holding."
                ],
                "common_mistakes": ["Front knee falling inward", "Torso leaning forward over front leg"],
                "safety_precautions": ["Keep chest and torso centered, directly over hips, shoulders relaxed down."],
                "avoid_if": ["Recent Knee or Hip Injury", "Diarrhea", "High Blood Pressure"],
                "muscles_targeted": ["Hamstrings", "Inner Thighs", "Glutes", "Deltoids"],
                "suitable_diseases": ["Obesity", "Sciatica"],
                "imageUrl": "/assets/yoga/virabhadrasana_ii.jpg"
            },
            {
                "name": "Warrior III Pose",
                "sanskrit_name": "Virabhadrasana III",
                "short_description": "An advanced balancing pose that builds extreme core stability and leg strength.",
                "category": ["Advanced Yoga", "Weight Loss", "Strength", "Flexibility", "Back Pain"],
                "difficulty": "Advanced",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 35.0,
                "benefits": [
                    "Strengthens ankles, legs, shoulders, and back",
                    "Improves full body balance and coordinate stability",
                    "Tones the core, abdominal muscles, and glutes"
                ],
                "step_by_step_instructions": [
                    "From Warrior I, lean forward over front thigh. Reach arms straight forward.",
                    "Shift weight onto front leg. Inhale, slowly lift back leg up parallel to the floor.",
                    "Keep arms, torso, and back leg in a single straight line. Hold for 20-30 seconds."
                ],
                "breathing_instructions": [
                    "Inhale while shifting weight and extending body.",
                    "Breathe steadily, keeping core tight on each exhale."
                ],
                "common_mistakes": ["Hips opening sideways (keep hips square to floor)", "Locking standing knee joint"],
                "safety_precautions": ["Micro-bend standing knee. Extend energy through back heel and fingers."],
                "avoid_if": ["High Blood Pressure", "Heart Conditions", "Severe Knee or Hip Pain"],
                "muscles_targeted": ["Hamstrings", "Glutes", "Spinal Erectors", "Core"],
                "suitable_diseases": ["Obesity", "Mild Back Pain"],
                "imageUrl": "/assets/yoga/virabhadrasana_iii.jpg"
            },
            {
                "name": "Child's Pose",
                "sanskrit_name": "Balasana",
                "short_description": "A restorative, calming posture that gently stretches the back, hips, and releases stress.",
                "category": ["Beginner Yoga", "Stress Relief", "Anxiety", "Depression", "Back Pain", "Neck Pain", "Senior Yoga", "Pregnancy (Safe poses only)"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 8.0,
                "benefits": [
                    "Gently stretches hips, thighs, and ankles",
                    "Calms the brain and central nervous system",
                    "Relieves lower back pain, neck strain, and mental fatigue"
                ],
                "step_by_step_instructions": [
                    "Kneel on the floor, sit on heels, big toes touching. Separate knees wide.",
                    "Exhale, bend forward from hips, laying torso down between thighs.",
                    "Rest forehead gently on mat. Stretch arms forward palms down. Relax for 2 minutes."
                ],
                "breathing_instructions": [
                    "Exhale as you fold forward.",
                    "Inhale deeply into the back body and ribs.",
                    "Exhale to release tension and sink closer to the mat."
                ],
                "common_mistakes": ["Hips lifting off heels", "Straining neck to touch forehead down"],
                "safety_precautions": ["Place a pillow under hips or forehead if knees are stiff or tight"],
                "avoid_if": ["Knee Injury", "Diarrhea", "Pregnancy (if causing abdominal pressure)"],
                "muscles_targeted": ["Gluteus Maximus", "Lower Back", "Shoulders", "Neck"],
                "suitable_diseases": ["Stress", "Anxiety", "Hypertension", "Back Pain", "Neck Pain"],
                "imageUrl": "/assets/yoga/balasana.jpg"
            },
            {
                "name": "Corpse Pose",
                "sanskrit_name": "Shavasana",
                "short_description": "The ultimate relaxation posture that lowers blood pressure, eliminates stress, and resets the nervous system.",
                "category": ["Beginner Yoga", "Senior Yoga", "Stress Relief", "Anxiety", "Depression", "Hypertension", "Heart Health", "Pregnancy (Safe poses only)"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 5.0,
                "benefits": [
                    "Lowers heart rate and blood pressure levels",
                    "Promotes deep restful sleep, fighting insomnia",
                    "Relieves stress, headache, anxiety, and full body fatigue"
                ],
                "step_by_step_instructions": [
                    "Lie flat on your back, legs spread comfortably wide, toes splayed outward.",
                    "Arms away from torso, palms facing upward, shoulders relaxed down.",
                    "Close eyes, breathe slowly, relax every muscle, and focus solely on breath."
                ],
                "breathing_instructions": [
                    "Allow breath to become natural, slow, and effortless.",
                    "Focus mind on the rise and fall of the navel."
                ],
                "common_mistakes": ["Moving or twitching", "Falling asleep (maintain conscious awareness)"],
                "safety_precautions": ["Place a small pillow under knees if lower back feels compressed/painful"],
                "avoid_if": ["Late-term pregnancy (lie on left side instead with pillows)"],
                "muscles_targeted": ["Full Body", "Nervous System"],
                "suitable_diseases": ["Hypertension", "Insomnia", "Anxiety", "Depression", "Heart Disease"],
                "imageUrl": "/assets/yoga/shavasana.jpg"
            },
            {
                "name": "Bridge Pose",
                "sanskrit_name": "Setu Bandhasana",
                "short_description": "A rejuvenating backbend that stretches the chest, strengthens the lower back, and helps regulate thyroid.",
                "category": ["Beginner Yoga", "Back Pain", "PCOS", "PCOD", "Thyroid", "Hypertension"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 3,
                "calories_burned": 16.0,
                "benefits": [
                    "Strengthens lower back, glutes, hamstrings, and core muscles",
                    "Relieves backache, neck tension, and minor chest tightness",
                    "Stimulates thyroid glands and regulates reproductive hormones"
                ],
                "step_by_step_instructions": [
                    "Lie on back, bend knees, place feet flat on floor hip-width apart.",
                    "Inhale, press feet and arms down, lift hips and spine up off the floor.",
                    "Interlace fingers under back, roll shoulders under, and lift chest. Hold for 30 seconds."
                ],
                "breathing_instructions": [
                    "Inhale as you raise your hips and expand the chest.",
                    "Breathe slowly and rhythmically while holding the posture."
                ],
                "common_mistakes": ["Allowing knees to splay outward", "Turning the neck while in the pose"],
                "safety_precautions": ["Keep neck straight. Do not turn head. Support lower spine with block if needed."],
                "avoid_if": ["Severe Neck Injury", "Recent Shoulder Surgery", "Pregnancy (unless supported)"],
                "muscles_targeted": ["Glutes", "Hamstrings", "Lower Back", "Abdominals"],
                "suitable_diseases": ["Back Pain", "Hypothyroidism", "PCOS", "PCOD", "Anxiety"],
                "imageUrl": "/assets/yoga/setu_bandhasana.jpg"
            },
            {
                "name": "Camel Pose",
                "sanskrit_name": "Ustrasana",
                "short_description": "A deep backward bend that opens the entire front body, stretches the lungs, and targets the thyroid.",
                "category": ["Advanced Yoga", "Thyroid", "Back Pain", "PCOS", "PCOD", "Flexibility", "Morning Yoga"],
                "difficulty": "Advanced",
                "duration_sec": 40,
                "repetitions": 2,
                "calories_burned": 28.0,
                "benefits": [
                    "Deeply stretches chest, abdomen, lungs, and hip flexors",
                    "Improves spinal flexibility and relieves back pain",
                    "Stimulates endocrine system, particularly the thyroid gland"
                ],
                "step_by_step_instructions": [
                    "Kneel on floor with knees hip-width apart. Rest hands on lower back, fingers pointing down.",
                    "Inhale, lift chest. Exhale, arch spine back. Place hands on heels one by one.",
                    "Relax neck back, push hips forward. Hold for 20-30 seconds. Support back on exit."
                ],
                "breathing_instructions": [
                    "Inhale deeply while lengthening torso before bending.",
                    "Breathe evenly through the nose while arching back."
                ],
                "common_mistakes": ["Letting knees slide outward", "Collapsing lower spine (keep lifting chest upward)"],
                "safety_precautions": ["Keep hands on lower back instead of heels if spine is stiff"],
                "avoid_if": ["Severe Back/Neck Injury", "High Blood Pressure", "Insomnia", "Migraine"],
                "muscles_targeted": ["Quads", "Psoas", "Abdominals", "Chest", "Thyroid"],
                "suitable_diseases": ["Hypothyroidism", "Thyroiditis", "PCOS", "Back Pain"],
                "imageUrl": "/assets/yoga/ustrasana.jpg"
            },
            {
                "name": "Bow Pose",
                "sanskrit_name": "Dhanurasana",
                "short_description": "A powerful backward bend that resembles a bow, highly effective for diabetes control and core strength.",
                "category": ["Advanced Yoga", "Diabetes", "Weight Loss", "Back Pain", "Digestive Health", "Constipation"],
                "difficulty": "Intermediate",
                "duration_sec": 30,
                "repetitions": 3,
                "calories_burned": 18.0,
                "benefits": [
                    "Massages pancreas, kidneys, and liver, regulating blood sugar levels",
                    "Reduces abdominal fat and relieves constipation",
                    "Strengthens back muscles and relieves chronic stiffness"
                ],
                "step_by_step_instructions": [
                    "Lie flat on stomach, feet hip-width. Fold knees and grasp ankles with hands.",
                    "Inhale, lift chest and pull ankles up and back, raising thighs off the floor.",
                    "Look forward, balance on abdomen. Hold for 15-20 seconds. Repeat 3 times."
                ],
                "breathing_instructions": [
                    "Inhale deeply as you lift the chest and thighs.",
                    "Hold breath slightly or breathe softly while in pose.",
                    "Exhale as you release."
                ],
                "common_mistakes": ["Grabbing toes instead of ankles", "Allowing knees to splay wider than hips"],
                "safety_precautions": ["Lift only as much as comfortable. Keep knees aligned with hips."],
                "avoid_if": ["Pregnancy", "Hernia", "Ulcers", "Hypertension", "Recent Abdominal Surgery"],
                "muscles_targeted": ["Back Muscles", "Core", "Quads", "Shoulders", "Pectorals"],
                "suitable_diseases": ["Diabetes", "Obesity", "Constipation", "Back Pain"],
                "imageUrl": "/assets/yoga/dhanurasana.jpg"
            },
            {
                "name": "Boat Pose",
                "sanskrit_name": "Navasana",
                "short_description": "A seated posture that builds core strength, tones the stomach, and burns belly fat.",
                "category": ["Advanced Yoga", "Weight Loss", "Diabetes", "Digestive Health", "Strength"],
                "difficulty": "Intermediate",
                "duration_sec": 30,
                "repetitions": 3,
                "calories_burned": 18.0,
                "benefits": [
                    "Deeply strengthens the core, hip flexors, and lower back",
                    "Improves digestion, relieves gas and bloating",
                    "Balances blood sugar by activating abdominal organs"
                ],
                "step_by_step_instructions": [
                    "Sit straight, knees bent, feet flat. Lean back slightly, keeping spine tall.",
                    "Lift feet off floor. Straighten legs to a 45-degree angle, body forming a 'V' shape.",
                    "Extend arms forward parallel to floor, palms facing inward. Hold for 30 seconds."
                ],
                "breathing_instructions": [
                    "Inhale to lengthen spine before lifting legs.",
                    "Breathe slowly, keeping the navel pulled in toward the spine."
                ],
                "common_mistakes": ["Rounding the spine", "Allowing chest to sink backward"],
                "safety_precautions": ["Keep knees bent parallel to floor (Half Boat) if full version strains back"],
                "avoid_if": ["Pregnancy", "Heart Disease", "Insomnia", "Severe Lower Back Herniation"],
                "muscles_targeted": ["Rectus Abdominis", "Iliopsoas", "Erector Spinae", "Quadriceps"],
                "suitable_diseases": ["Obesity", "Diabetes", "Indigestion"],
                "imageUrl": "/assets/yoga/navasana.jpg"
            },
            {
                "name": "Thunderbolt Pose",
                "sanskrit_name": "Vajrasana",
                "short_description": "A kneeling meditative pose that promotes optimal digestion and is safe to practice after meals.",
                "category": ["Beginner Yoga", "Senior Yoga", "Diabetes", "Constipation", "Digestive Health", "Office Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 20.0,
                "benefits": [
                    "Increases blood flow to stomach and intestines, boosting digestion",
                    "Prevents acidity, bloating, and chronic constipation",
                    "Calms pelvic nerves and controls blood sugar fluctuations"
                ],
                "step_by_step_instructions": [
                    "Kneel on the floor. Bring big toes to touch, separate heels.",
                    "Sit back on the heels, keeping knees together.",
                    "Align spine, neck straight, rest palms on knees. Close eyes and breathe deeply for 5 minutes."
                ],
                "breathing_instructions": [
                    "Deep, rhythmic abdominal breathing to stimulate the digestive tract."
                ],
                "common_mistakes": ["Slouching the back", "Sitting with heels compressed directly under buttocks instead of splayed"],
                "safety_precautions": ["Place a folded towel or blanket under shins/ankles to relieve stiffness"],
                "avoid_if": ["Severe Knee Pain", "Ankle Injury", "Arthritis of the Knees", "Gout"],
                "muscles_targeted": ["Quadriceps", "Tibialis Anterior", "Knees", "Spine"],
                "suitable_diseases": ["Indigestion", "Acidity", "Constipation", "Diabetes"],
                "imageUrl": "/assets/yoga/vajrasana.jpg"
            },
            {
                "name": "Lotus Pose",
                "sanskrit_name": "Padmasana",
                "short_description": "The quintessential seated meditation posture that calms the brain and unlocks hip flexibility.",
                "category": ["Advanced Yoga", "Meditation", "Stress Relief", "Anxiety", "Flexibility"],
                "difficulty": "Advanced",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 8.0,
                "benefits": [
                    "Promotes mental peace, mindfulness, and focused concentration",
                    "Stretches knees, ankles, and opens hips deeply",
                    "Improves sitting posture and aligns vertebrae"
                ],
                "step_by_step_instructions": [
                    "Sit on floor, legs straight. Bend right knee, place right foot on left thigh.",
                    "Bend left knee, carefully lift left foot and cross it over right shin to place on right thigh.",
                    "Keep spine straight, hand in Gyan Mudra on knees. Close eyes."
                ],
                "breathing_instructions": [
                    "Slow, smooth, controlled diaphragmatic breaths."
                ],
                "common_mistakes": ["Forcing knees down when hips are tight (causes knee ligament strain)"],
                "safety_precautions": ["Practice Half Lotus (Ardha Padmasana) first to avoid knee injury"],
                "avoid_if": ["Knee Injury", "Ankle Injury", "Sciatica Flareup"],
                "muscles_targeted": ["Adductors", "Ankles", "Knees", "Spine"],
                "suitable_diseases": ["Stress", "Anxiety", "Insomnia"],
                "imageUrl": "/assets/yoga/padmasana.jpg"
            },
            {
                "name": "Easy Pose",
                "sanskrit_name": "Sukhasana",
                "short_description": "A comfortable, cross-legged seated pose ideal for beginners, meditation, and breathing routines.",
                "category": ["Beginner Yoga", "Senior Yoga", "Office Yoga", "Meditation", "Stress Relief", "Anxiety", "Pregnancy (Safe poses only)"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 10.0,
                "benefits": [
                    "Calms the mind, reducing anxiety and daily stress",
                    "Stretches the knees and ankles, and keeps spine straight",
                    "Improves alignment and supports lung expansion"
                ],
                "step_by_step_instructions": [
                    "Sit on the floor. Cross your shins, slide your feet under opposite knees.",
                    "Keep spine tall, shoulders relaxed, chest open.",
                    "Rest hands on knees palms up or down. Close eyes and focus on breathing."
                ],
                "breathing_instructions": [
                    "Practice deep, slow pranayama breathing (inhaling 4s, exhaling 4s)."
                ],
                "common_mistakes": ["Rounding the lower back", "Tensing the shoulders or neck"],
                "safety_precautions": ["Sit on a folded blanket or yoga block if knees lift high off the floor"],
                "avoid_if": ["Recent Knee Injury", "Severe Hip Stiffness"],
                "muscles_targeted": ["Spine", "Hips", "Inner Thighs"],
                "suitable_diseases": ["Hypertension", "Anxiety", "Stress"],
                "imageUrl": "/assets/yoga/sukhasana.jpg"
            },
            {
                "name": "Seated Forward Bend",
                "sanskrit_name": "Paschimottanasana",
                "short_description": "A deep seated forward stretch that stretches the hamstrings, spine, and acts as a digestive massage.",
                "category": ["Advanced Yoga", "Diabetes", "Flexibility", "Back Pain", "Digestive Health"],
                "difficulty": "Intermediate",
                "duration_sec": 90,
                "repetitions": 3,
                "calories_burned": 18.0,
                "benefits": [
                    "Deeply stretches hamstrings, calves, and full length of spine",
                    "Stimulates abdominal organs, helping manage diabetes",
                    "Relieves mild backache and mental anxiety"
                ],
                "step_by_step_instructions": [
                    "Sit with legs extended straight forward. Spine upright, toes flexed back.",
                    "Inhale, raise arms overhead. Exhale, fold forward from hips.",
                    "Reach hands to grasp toes or shins. Draw chest towards shins. Hold for 30-45 seconds."
                ],
                "breathing_instructions": [
                    "Inhale to create space and length in the spine.",
                    "Exhale to fold deeper, relaxing the neck."
                ],
                "common_mistakes": ["Rounding the upper back to touch head down", "Locking knees aggressively"],
                "safety_precautions": ["Keep knees slightly bent and focus on folding from hips, keeping chest long"],
                "avoid_if": ["Severe Herniated Disc", "Sciatica Flareup", "Pregnancy", "Diarrhea"],
                "muscles_targeted": ["Hamstrings", "Calves", "Erector Spinae", "Glutes"],
                "suitable_diseases": ["Diabetes", "Constipation", "High Blood Pressure"],
                "imageUrl": "/assets/yoga/paschimottanasana.jpg"
            },
            {
                "name": "Half Lord of the Fishes Pose",
                "sanskrit_name": "Ardha Matsyendrasana",
                "short_description": "A deep spinal twist that improves spine rotation, massages internal organs, and aids diabetes care.",
                "category": ["Advanced Yoga", "Diabetes", "Back Pain", "PCOS", "PCOD", "Flexibility", "Digestive Health"],
                "difficulty": "Intermediate",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 18.0,
                "benefits": [
                    "Increases spinal rotation flexibility and relieves stiffness",
                    "Stimulates liver and pancreas, optimizing insulin release",
                    "Tones abdomen and aids digestive health"
                ],
                "step_by_step_instructions": [
                    "Sit with legs straight. Bend right knee, place right foot outside left knee on floor.",
                    "Bend left knee, bringing left heel close to right hip.",
                    "Inhale, lift left arm up. Exhale, twist torso right. Wrap left arm around right knee.",
                    "Place right hand on floor behind spine. Look over right shoulder. Hold for 30s. Repeat."
                ],
                "breathing_instructions": [
                    "Inhale to lift and lengthen the spine.",
                    "Exhale to gently twist deeper from the upper back."
                ],
                "common_mistakes": ["Slouching back (keep spine vertical)", "Forcing the twist with arm strength"],
                "safety_precautions": ["Keep both sitting bones grounded on floor. Twist from ribcage, not lower back."],
                "avoid_if": ["Severe Spine Injury", "Pregnancy", "Recent Abdominal Surgery", "Hernia"],
                "muscles_targeted": ["Spine Muscles", "Shoulders", "Hips", "Neck"],
                "suitable_diseases": ["Diabetes", "Back Pain", "PCOS", "Indigestion"],
                "imageUrl": "/assets/yoga/ardha_matsyendrasana.jpg"
            },
            {
                "name": "Bound Angle Pose",
                "sanskrit_name": "Baddha Konasana",
                "short_description": "A sitting hip-opener that increases blood circulation to reproductive organs and relieves menstrual pain.",
                "category": ["Beginner Yoga", "Senior Yoga", "PCOS", "PCOD", "Pregnancy (Safe poses only)", "Post Pregnancy", "Women's Health", "Flexibility"],
                "difficulty": "Beginner",
                "duration_sec": 35,
                "repetitions": 1,
                "calories_burned": 15.0,
                "benefits": [
                    "Improves blood circulation in pelvis and pelvic organs",
                    "Stretches inner thighs, groins, and knees",
                    "Helps relieve symptoms of PCOS and menstrual discomfort"
                ],
                "step_by_step_instructions": [
                    "Sit straight. Bend knees and bring soles of feet together, pulling heels toward pelvis.",
                    "Clasp feet with hands. Keep spine straight and chest open.",
                    "Gently bounce thighs up and down like butterfly wings, or hold static for 2 minutes."
                ],
                "breathing_instructions": [
                    "Breathe slowly, deeply, and continuously into the lower abdomen."
                ],
                "common_mistakes": ["Rounding the spine", "Pushing knees down aggressively"],
                "safety_precautions": ["Place cushions under knees if hips are tight to avoid knee strain"],
                "avoid_if": ["Severe Knee Injury", "Severe Groin Injury", "Sciatica"],
                "muscles_targeted": ["Inner Thighs", "Groin", "Hips", "Lower Back"],
                "suitable_diseases": ["PCOS", "PCOD", "Menstrual Disorders", "Anxiety"],
                "imageUrl": "/assets/yoga/baddha_konasana.jpg"
            },
            {
                "name": "Garland Pose",
                "sanskrit_name": "Malasana",
                "short_description": "A deep squat pose that stretches the groin, ankles, and lower back, promoting digestive movement.",
                "category": ["Beginner Yoga", "Pregnancy (Safe poses only)", "Digestive Health", "Constipation", "Flexibility", "Evening Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 2,
                "calories_burned": 14.0,
                "benefits": [
                    "Stretches ankles, groin, and back torso",
                    "Tones the lower body and core muscles",
                    "Improves bowel movements and fights constipation"
                ],
                "step_by_step_instructions": [
                    "Stand with feet slightly wider than hip-width, toes turned out.",
                    "Exhale, bend knees, and lower hips into a deep squat.",
                    "Bring elbows to inner knees, press palms together in prayer at chest. Hold for 30-45 seconds."
                ],
                "breathing_instructions": [
                    "Exhale as you lower into the squat.",
                    "Deep abdominal breathing to release pelvic floor tension."
                ],
                "common_mistakes": ["Heels lifting off floor (keep feet flat)", "Slouching spine forward"],
                "safety_precautions": ["Place a rolled blanket under heels if they lift, or sit on a block"],
                "avoid_if": ["Knee Injury", "Lower Back Injury"],
                "muscles_targeted": ["Glutes", "Ankles", "Hip Flexors", "Pelvic Floor"],
                "suitable_diseases": ["Constipation", "Flat Feet"],
                "imageUrl": "/assets/yoga/malasana.jpg"
            },
            {
                "name": "Eagle Pose",
                "sanskrit_name": "Garudasana",
                "short_description": "A standing balance posture that opens the shoulders and strengthens the thigh and calf muscles.",
                "category": ["Advanced Yoga", "Joint Pain", "Flexibility", "Strength", "Stress Relief"],
                "difficulty": "Intermediate",
                "duration_sec": 60,
                "repetitions": 2,
                "calories_burned": 16.0,
                "benefits": [
                    "Strengthens and stretches calves, ankles, and thighs",
                    "Stretches upper back, shoulders, and outer hips",
                    "Develops concentration, alertness, and balance"
                ],
                "step_by_step_instructions": [
                    "Stand straight. Bend knees slightly. Lift left foot, cross left thigh over right thigh.",
                    "Tuck left toes behind right calf. Extend arms forward.",
                    "Cross right arm over left, bend elbows, and press palms together. Lift elbows. Hold 20s. Repeat."
                ],
                "breathing_instructions": [
                    "Inhale to expand upper back chest.",
                    "Maintain steady, relaxed breathing while focusing on a balance point."
                ],
                "common_mistakes": ["Allowing torso to tilt forward", "Forgetting to lift elbows up to shoulder level"],
                "safety_precautions": ["Unwrap toes and touch floor if balance is lost. Stand near wall."],
                "avoid_if": ["Recent Knee or Ankle Injury", "Vertigo", "Late-term Pregnancy"],
                "muscles_targeted": ["Thighs", "Calves", "Shoulders", "Upper Back"],
                "suitable_diseases": ["Joint Stiffness", "Sciatica", "Stress"],
                "imageUrl": "/assets/yoga/garudasana.jpg"
            },
            {
                "name": "Cow Face Pose",
                "sanskrit_name": "Gomukhasana",
                "short_description": "A seated posture that stretches shoulders and hips, highly recommended for sciatica and back pain.",
                "category": ["Beginner Yoga", "Back Pain", "Shoulder Pain", "Sciatica", "Flexibility"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 2,
                "calories_burned": 12.0,
                "benefits": [
                    "Opens chest, shoulders, and stretches outer hips and thighs",
                    "Relieves backache, shoulder stiffness, and sciatica pain",
                    "Improves lung capacity and rib cage mobility"
                ],
                "step_by_step_instructions": [
                    "Sit with legs straight. Cross left knee over right knee, stacking them vertically.",
                    "Bring left heel close to right hip, right heel close to left hip.",
                    "Raise right arm overhead, bend elbow down back. Reach left arm behind and up back.",
                    "Clasp fingers behind back. Hold spine straight for 30-45 seconds. Repeat on other side."
                ],
                "breathing_instructions": [
                    "Inhale to lengthen spine and open chest.",
                    "Exhale to relax shoulders and hips."
                ],
                "common_mistakes": ["Rounding the spine (keep chest lifted)", "Head pushing forward (keep chin parallel)"],
                "safety_precautions": ["Use a strap or towel to connect hands if they do not reach each other"],
                "avoid_if": ["Severe Shoulder Injury", "Severe Knee Injury"],
                "muscles_targeted": ["Triceps", "Deltoids", "Glutes", "Piriformis"],
                "suitable_diseases": ["Sciatica", "Shoulder Stiffness", "Back Pain"],
                "imageUrl": "/assets/yoga/gomukhasana.jpg"
            },
            {
                "name": "Fish Pose",
                "sanskrit_name": "Matsyasana",
                "short_description": "A reclining backbend that opens the throat and chest, helping relieve thyroid imbalances and respiratory issues.",
                "category": ["Beginner Yoga", "Thyroid", "Anxiety", "Flexibility", "Pranayama"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 10.0,
                "benefits": [
                    "Stretches chest, throat, and respiratory muscles, improving lung function",
                    "Stimulates thyroid and parathyroid glands",
                    "Corrects rounded shoulders and bad posture"
                ],
                "step_by_step_instructions": [
                    "Lie on back, knees bent, arms at sides. Slide hands under buttocks, palms down.",
                    "Inhale, press forearms and elbows into floor, arch chest up, lifting head off floor.",
                    "Rest the crown of head gently on floor. Hold for 30 seconds, breathing deeply."
                ],
                "breathing_instructions": [
                    "Inhale deeply as you arch chest and lift the thoracic spine.",
                    "Ensure deep, full, slow chest breathing."
                ],
                "common_mistakes": ["Placing too much weight on head (weight must be in elbows and forearms)"],
                "safety_precautions": ["If head resting is uncomfortable, place a rolled blanket under chest"],
                "avoid_if": ["High Blood Pressure", "Migraine", "Severe Neck or Lower Back Injury"],
                "muscles_targeted": ["Neck Flexors", "Intercostals", "Pectorals", "Upper Back"],
                "suitable_diseases": ["Hypothyroidism", "Asthma", "Stress"],
                "imageUrl": "/assets/yoga/matsyasana.jpg"
            },
            {
                "name": "Plow Pose",
                "sanskrit_name": "Halasana",
                "short_description": "An advanced inversion pose that stretches the entire spine and activates the endocrine thyroid gland.",
                "category": ["Advanced Yoga", "Thyroid", "Diabetes", "PCOS", "PCOD", "Flexibility"],
                "difficulty": "Advanced",
                "duration_sec": 30,
                "repetitions": 1,
                "calories_burned": 30.0,
                "benefits": [
                    "Deeply stretches and stretches the spine, relieving stiffness",
                    "Massages abdominal organs, helping manage diabetes and PCOS",
                    "Stimulates the thyroid gland, regulating metabolic rate"
                ],
                "step_by_step_instructions": [
                    "Lie on back, arms beside body, palms down.",
                    "Inhale, lift legs to 90 degrees. Exhale, roll hips and spine up off floor, sending feet over head.",
                    "Touch toes to floor behind head. Keep knees straight. Support lower back. Hold 30s."
                ],
                "breathing_instructions": [
                    "Exhale while lifting hips and legs over head.",
                    "Breathe softly and carefully while in the pose; do not hold breath."
                ],
                "common_mistakes": ["Turning the head (never turn head in shoulder stand or plow)", "Bending knees"],
                "safety_precautions": ["Support back with hands. Place blanket under shoulders to protect neck."],
                "avoid_if": ["Neck Injury", "Hypertension", "Pregnancy", "Menstruation", "Heart Conditions"],
                "muscles_targeted": ["Spinal Erectors", "Trapezius", "Hamstrings", "Thyroid"],
                "suitable_diseases": ["Hypothyroidism", "Diabetes", "PCOS", "PCOD"],
                "imageUrl": "/assets/yoga/halasana.jpg"
            },
            {
                "name": "Headstand",
                "sanskrit_name": "Sirsasana",
                "short_description": "An advanced inversion requiring balance and strength, highly effective for brain health and concentration.",
                "category": ["Advanced Yoga", "Heart Health", "Stress Relief", "Anxiety", "Strength"],
                "difficulty": "Advanced",
                "duration_sec": 60,
                "repetitions": 1,
                "calories_burned": 40.0,
                "benefits": [
                    "Increases oxygen and blood supply to brain cells",
                    "Strengthens core, arms, shoulders, and neck muscles",
                    "Improves focus, cognitive clarity, and acts as anti-aging"
                ],
                "step_by_step_instructions": [
                    "Kneel down, interlace fingers, place forearms on mat to form a triangle.",
                    "Place crown of head in cupped hands. Lift knees, walk feet close to head.",
                    "Engage core, slowly lift legs bent, then straighten legs vertically. Hold 30 seconds."
                ],
                "breathing_instructions": [
                    "Exhale as you lift legs. Maintain steady, shallow breathing while holding."
                ],
                "common_mistakes": ["Kicking legs up aggressively", "Collapsing shoulders (keep forearms pressing down)"],
                "safety_precautions": ["Practice against a wall first. Never try without proper neck and core strength."],
                "avoid_if": ["Hypertension", "Heart Disease", "Glaucoma", "Neck/Spine Injury", "Pregnancy"],
                "muscles_targeted": ["Neck", "Shoulders", "Core", "Triceps", "Spine"],
                "suitable_diseases": ["Anxiety", "Brain Fatigue"],
                "imageUrl": "/assets/yoga/sirsasana.jpg"
            },
            {
                "name": "Chair Pose",
                "sanskrit_name": "Utkatasana",
                "short_description": "A powerful standing squat pose that tones the thighs, strengthens core, and builds cardiovascular endurance.",
                "category": ["Beginner Yoga", "Weight Loss", "Strength", "Knee Pain", "Joint Pain", "Morning Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 3,
                "calories_burned": 22.0,
                "benefits": [
                    "Strengthens ankles, calves, thighs, and spine",
                    "Stimulates abdominal organs, heart, and diaphragm",
                    "Tones legs and burns thigh fat"
                ],
                "step_by_step_instructions": [
                    "Stand straight. Inhale, raise arms overhead, palms facing.",
                    "Exhale, bend knees and lower hips as if sitting in an imaginary chair.",
                    "Keep chest lifted and weight back in heels. Hold for 30 seconds."
                ],
                "breathing_instructions": [
                    "Inhale while raising arms.",
                    "Exhale as you sink into the squat.",
                    "Maintain continuous, steady breathing."
                ],
                "common_mistakes": ["Knees drifting forward past toes", "Rounding the spine and dropping chest"],
                "safety_precautions": ["Keep knees aligned with second toes. Sit only as deep as knees allow without pain."],
                "avoid_if": ["Chronic Knee Pain", "Low Blood Pressure", "Insomnia", "Headache"],
                "muscles_targeted": ["Quadriceps", "Glutes", "Calves", "Core", "Lower Back"],
                "suitable_diseases": ["Obesity", "Mild Knee Stiffness"],
                "imageUrl": "/assets/yoga/utkatasana.jpg"
            },
            {
                "name": "Revolved Triangle Pose",
                "sanskrit_name": "Parivrtta Trikonasana",
                "short_description": "A twisting standing posture that challenges balance, stretches hamstrings, and twists the spine.",
                "category": ["Advanced Yoga", "Digestive Health", "Diabetes", "Flexibility", "Strength"],
                "difficulty": "Advanced",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 24.0,
                "benefits": [
                    "Improves balance, hip stability, and stretches hamstrings",
                    "Stimulates abdominal organs, helping manage diabetes and sluggish digestion",
                    "Relieves back stiffness"
                ],
                "step_by_step_instructions": [
                    "Stand, feet 3 feet apart. Step right foot back, hip facing forward.",
                    "Inhale, raise left arm. Exhale, fold from hips, twisting torso right.",
                    "Place left hand on right shin or floor outside foot. Extend right arm up. Gaze up. Hold 30s."
                ],
                "breathing_instructions": [
                    "Inhale to stretch and extend the spine.",
                    "Exhale to deepen the twist from the core."
                ],
                "common_mistakes": ["Lifting back heel off floor", "Rounding back to reach the floor"],
                "safety_precautions": ["Use a block under bottom hand to maintain spine length and avoid rounding"],
                "avoid_if": ["Back or Spine Injury", "Pregnancy", "Low Blood Pressure", "Migraine"],
                "muscles_targeted": ["Hamstrings", "Spinal Erectors", "Glutes", "Obliques"],
                "suitable_diseases": ["Diabetes", "Indigestion", "Sciatica"],
                "imageUrl": "/assets/yoga/parivrtta_trikonasana.jpg"
            },
            {
                "name": "Extended Side Angle Pose",
                "sanskrit_name": "Parsvakonasana",
                "short_description": "A standing posture that stretches the entire lateral side of the body while building thigh stamina.",
                "category": ["Beginner Yoga", "Weight Loss", "Flexibility", "Strength", "Constipation"],
                "difficulty": "Intermediate",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 26.0,
                "benefits": [
                    "Stretches groin, hamstrings, intercostals, and shoulders",
                    "Builds stamina and tones thighs and abdominal core",
                    "Stimulates digestives and helps relieve constipation"
                ],
                "step_by_step_instructions": [
                    "Stand, feet 4 feet apart. Turn right foot out 90 degrees. Bend right knee to 90 degrees.",
                    "Inhale, extend arms. Exhale, place right elbow on right thigh (or hand on block/floor).",
                    "Reach left arm over left ear, creating a straight diagonal line. Gaze at left hand. Hold 30s."
                ],
                "breathing_instructions": [
                    "Inhale as you stretch the side body.",
                    "Exhale as you sink hips forward and down, keeping knee stable."
                ],
                "common_mistakes": ["Allowing chest to face floor", "Front knee moving forward of ankle"],
                "safety_precautions": ["Press firmly into back heel. Do not rest all body weight on front arm."],
                "avoid_if": ["Headache", "High or Low Blood Pressure", "Knee Injury"],
                "muscles_targeted": ["Quadriceps", "Psoas", "Obliques", "Chest", "Shoulders"],
                "suitable_diseases": ["Obesity", "Constipation"],
                "imageUrl": "/assets/yoga/parsvakonasana.jpg"
            },
            {
                "name": "Crescent Low Lunge Pose",
                "sanskrit_name": "Anjaneyasana",
                "short_description": "A deep lunging pose that opens hip flexors, stretches groin, and improves chest respiration.",
                "category": ["Beginner Yoga", "Flexibility", "Knee Pain", "Back Pain", "Morning Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 30,
                "repetitions": 2,
                "calories_burned": 20.0,
                "benefits": [
                    "Deeply stretches hip flexors (psoas) and quadriceps",
                    "Opens chest, shoulders, and improves deep breathing capacity",
                    "Relieves tension in lower back and glutes"
                ],
                "step_by_step_instructions": [
                    "From Downward Dog, step right foot forward between hands. Lower left knee to floor.",
                    "Inhale, lift torso, raise arms overhead. Reach chest and arms back.",
                    "Sink hips forward. Hold for 30-45 seconds. Repeat on left side."
                ],
                "breathing_instructions": [
                    "Inhale to lift chest and sweep arms up.",
                    "Exhale to sink hips forward into lunge stretch."
                ],
                "common_mistakes": ["Letting front knee collapse past toes", "Arching lower back without engaging core"],
                "safety_precautions": ["Place a blanket under back knee for padding if knee cap is sensitive"],
                "avoid_if": ["Recent Knee or Hip Injury", "Severe Lower Back Pain"],
                "muscles_targeted": ["Iliopsoas", "Quadriceps", "Glutes", "Pectorals"],
                "suitable_diseases": ["Back Pain", "Sciatica", "Anxiety"],
                "imageUrl": "/assets/yoga/anjaneyasana.jpg"
            },
            {
                "name": "Cat Pose",
                "sanskrit_name": "Marjaryasana",
                "short_description": "A seated kneeling posture that rounds the spine to release neck and spine muscle tension.",
                "category": ["Beginner Yoga", "Back Pain", "Neck Pain", "PCOS", "PCOD", "Pregnancy (Safe poses only)", "Senior Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 90,
                "repetitions": 3,
                "calories_burned": 10.0,
                "benefits": [
                    "Improves spine flexibility and coordination",
                    "Stretches neck, shoulders, and back muscles",
                    "Regulates menstrual discomfort and pelvic circulation in PCOS"
                ],
                "step_by_step_instructions": [
                    "Start on hands and knees, hands under shoulders, knees under hips.",
                    "Exhale, pull navel to spine, round back to ceiling like a cat. Tuck chin to chest.",
                    "Hold for 5-10 seconds. Return to neutral."
                ],
                "breathing_instructions": [
                    "Exhale completely as you pull belly in and round the spine upward."
                ],
                "common_mistakes": ["Shrugging shoulders", "Bending elbows during rotation"],
                "safety_precautions": ["Keep arms straight. Move spine vertebra by vertebra, slowly."],
                "avoid_if": ["Recent Wrist or Knee Injury", "Severe Neck Trauma"],
                "muscles_targeted": ["Rectus Abdominis", "Erector Spinae", "Trapezius", "Neck Muscles"],
                "suitable_diseases": ["Back Pain", "Neck Pain", "PCOS", "PCOD"],
                "imageUrl": "/assets/yoga/marjaryasana.jpg"
            },
            {
                "name": "Cow Pose",
                "sanskrit_name": "Bitilasana",
                "short_description": "A tabletop spinal expansion pose that arches the back to stretch neck, chest, and stimulate organs.",
                "category": ["Beginner Yoga", "Back Pain", "Neck Pain", "PCOS", "PCOD", "Pregnancy (Safe poses only)", "Senior Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 90,
                "repetitions": 3,
                "calories_burned": 10.0,
                "benefits": [
                    "Stretches front torso, neck, and abdomen",
                    "Stimulates adrenal glands and kidneys",
                    "Relieves chronic upper back stiffness and improves posture"
                ],
                "step_by_step_instructions": [
                    "Start on hands and knees, tabletop position.",
                    "Inhale, drop belly toward floor, lift chest and chin up. Look at ceiling.",
                    "Hold for 5-10 seconds, arching spine. Return to neutral."
                ],
                "breathing_instructions": [
                    "Inhale deeply as you arch the spine, open the chest, and gaze upward."
                ],
                "common_mistakes": ["Crunching neck too hard", "Locking elbow joints outward"],
                "safety_precautions": ["Keep shoulders down, away from ears. Gaze slightly up without pinching neck back."],
                "avoid_if": ["Wrist Injury", "Knee Arthritis", "Severe Back Injury"],
                "muscles_targeted": ["Erector Spinae", "Trapezius", "Pectorals", "Neck Flexors"],
                "suitable_diseases": ["Back Pain", "Neck Pain", "PCOS", "PCOD"],
                "imageUrl": "/assets/yoga/bitilasana.jpg"
            },
            {
                "name": "Wheel Pose",
                "sanskrit_name": "Chakrasana",
                "short_description": "An advanced backward arch pose that expands the lungs, regulates thyroid, and builds back strength.",
                "category": ["Advanced Yoga", "Thyroid", "Heart Health", "Strength", "Flexibility", "Morning Yoga"],
                "difficulty": "Advanced",
                "duration_sec": 45,
                "repetitions": 2,
                "calories_burned": 32.0,
                "benefits": [
                    "Deeply stretches and strengthens spine, shoulders, and chest",
                    "Stimulates thyroid gland and adrenal glands",
                    "Boosts energy, lung capacity, and heart circulation"
                ],
                "step_by_step_instructions": [
                    "Lie on back. Bend knees, place feet flat. Place hands beside head, fingers pointing to shoulders.",
                    "Inhale, press feet and hands down, lift hips, back, and head up, straightening arms.",
                    "Push chest forward, arch back fully. Hold for 15-20 seconds. Return down carefully."
                ],
                "breathing_instructions": [
                    "Inhale deeply before lifting.",
                    "Exhale as you push up.",
                    "Breathe shallowly but steadily while in the pose."
                ],
                "common_mistakes": ["Allowing feet to turn outward", "Splaying elbows (keep arms parallel)"],
                "safety_precautions": ["Ensure hands and feet do not slip. Keep core engaged to protect lumbar spine."],
                "avoid_if": ["Hypertension", "Heart Conditions", "Pregnancy", "Carpal Tunnel Syndrome", "Back Surgery"],
                "muscles_targeted": ["Triceps", "Glutes", "Spine Erectors", "Pectorals", "Iliopsoas"],
                "suitable_diseases": ["Hypothyroidism", "Asthma", "Postural Defects"],
                "imageUrl": "/assets/yoga/chakrasana.jpg"
            },
            {
                "name": "Wind Relieving Pose",
                "sanskrit_name": "Pavanamuktasana",
                "short_description": "A supine pose that compresses the abdomen, highly effective for releasing gas, bloating, and relieving back pain.",
                "category": ["Beginner Yoga", "Senior Yoga", "Digestive Health", "Constipation", "Back Pain", "Evening Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 90,
                "repetitions": 3,
                "calories_burned": 12.0,
                "benefits": [
                    "Releases trapped gas, bloating, and cures indigestion",
                    "Massages the abdominal organs and pelvic area",
                    "Gently stretches lower back and hips, reducing lumbar pain"
                ],
                "step_by_step_instructions": [
                    "Lie flat on back. Exhale, bend knees and draw them to chest.",
                    "Clasp hands around shins. Inhale, pull knees closer to chest.",
                    "Exhale, raise head, touch chin or nose to knees. Hold for 20 seconds. Repeat 3 times."
                ],
                "breathing_instructions": [
                    "Exhale completely as you pull knees to chest and lift head.",
                    "Breathe slowly while holding the pose."
                ],
                "common_mistakes": ["Straining neck to touch knees (keep head down if neck is sore)"],
                "safety_precautions": ["Press only to comfort level. Do not force head up if neck feels strained."],
                "avoid_if": ["Pregnancy", "Hernia", "Recent Abdominal Surgery", "Heart Issues", "Slip Disc"],
                "muscles_targeted": ["Gluteus Maximus", "Lower Back", "Abdominals", "Neck Muscles"],
                "suitable_diseases": ["Indigestion", "Acidity", "Constipation", "Flatulence", "Back Pain"],
                "imageUrl": "/assets/yoga/pavanamuktasana.jpg"
            },
            {
                "name": "Frog Pose",
                "sanskrit_name": "Mandukasana",
                "short_description": "A kneeling posture where fists compress the abdomen, promoting pancreatic activity and blood sugar regulation.",
                "category": ["Beginner Yoga", "Diabetes", "Weight Loss", "Digestive Health", "Constipation"],
                "difficulty": "Intermediate",
                "duration_sec": 120,
                "repetitions": 3,
                "calories_burned": 25.0,
                "benefits": [
                    "Stimulates pancreas, increasing insulin production and controlling diabetes",
                    "Improves digestion, relieves constipation and belly fat",
                    "Strengthens hips and back muscles"
                ],
                "step_by_step_instructions": [
                    "Sit in Vajrasana. Make fists, place thumbs inside fingers.",
                    "Place fists on lower abdomen, on both sides of navel.",
                    "Exhale, pull belly in, bend forward, pressing fists into abdomen. Keep chin up, look straight. Hold 30s."
                ],
                "breathing_instructions": [
                    "Exhale fully as you bend forward and pull belly in.",
                    "Hold normal, soft breathing while holding the pose."
                ],
                "common_mistakes": ["Lifting hips off heels while folding", "Lowering head (keep chin up to protect cervical spine)"],
                "safety_precautions": ["Press gently first. Keep eyes looking forward to avoid neck strain."],
                "avoid_if": ["Pregnancy", "Hernia", "Peptic Ulcer", "Severe Back Injury", "Heart Problems"],
                "muscles_targeted": ["Abdominals", "Pancreas", "Hips", "Lower Back"],
                "suitable_diseases": ["Diabetes", "Obesity", "Constipation", "Indigestion"],
                "imageUrl": "/assets/yoga/mandukasana.jpg"
            },
            {
                "name": "Standing Forward Bend",
                "sanskrit_name": "Uttanasana",
                "short_description": "A standing forward fold that stretches hamstrings, calms the mind, and lowers blood pressure.",
                "category": ["Beginner Yoga", "Stress Relief", "Anxiety", "Hypertension", "Flexibility", "Evening Yoga"],
                "difficulty": "Beginner",
                "duration_sec": 90,
                "repetitions": 3,
                "calories_burned": 15.0,
                "benefits": [
                    "Deeply stretches hamstrings, calves, and hips",
                    "Calms the nervous system, relieving stress and anxiety",
                    "Improves blood circulation to the brain"
                ],
                "step_by_step_instructions": [
                    "Stand straight. Inhale, raise arms overhead. Exhale, fold forward from hips.",
                    "Rest hands on shins, block, or floor beside feet.",
                    "Let head hang, relax neck. Hold for 30-45 seconds."
                ],
                "breathing_instructions": [
                    "Inhale to raise arms, exhale to fold from hips.",
                    "Slow, calm exhalations to release tension in back."
                ],
                "common_mistakes": ["Rounding the upper spine (keep spine long)", "Locking knees straight"],
                "safety_precautions": ["Bend knees slightly if hamstrings are tight to keep lower back safe"],
                "avoid_if": ["Severe Lower Back Injury", "Sciatica", "Late-term Pregnancy", "Glaucoma"],
                "muscles_targeted": ["Hamstrings", "Calves", "Glutes", "Spine Erectors"],
                "suitable_diseases": ["Hypertension", "Stress", "Anxiety"],
                "imageUrl": "/assets/yoga/uttanasana.jpg"
            },
            {
                "name": "Wide-Legged Forward Bend",
                "sanskrit_name": "Prasarita Padottanasana",
                "short_description": "A wide-stance standing forward fold that opens the inner thighs and acts as a mild inversion.",
                "category": ["Beginner Yoga", "Hypertension", "Stress Relief", "Anxiety", "Flexibility"],
                "difficulty": "Beginner",
                "duration_sec": 90,
                "repetitions": 2,
                "calories_burned": 16.0,
                "benefits": [
                    "Stretches inner thighs, groin, hamstrings, and shoulders",
                    "Calms the mind, eases headache and fatigue",
                    "Increases blood flow to the head, reducing hypertension"
                ],
                "step_by_step_instructions": [
                    "Stand with feet 4 feet apart, toes pointing forward.",
                    "Inhale, hands on hips, lift chest. Exhale, fold forward from hips.",
                    "Place hands on floor between feet. Lower head toward floor. Hold for 30-45 seconds."
                ],
                "breathing_instructions": [
                    "Inhale to stand tall and lengthen.",
                    "Exhale to fold forward, releasing head down."
                ],
                "common_mistakes": ["Rounding the lower spine", "Shifting weight onto heels (keep weight balanced)"],
                "safety_precautions": ["Use blocks under hands if they do not reach the floor comfortably"],
                "avoid_if": ["Severe Hamstring Tear", "Lower Back Hernia", "Vertigo"],
                "muscles_targeted": ["Inner Thighs", "Hamstrings", "Glutes", "Spinal Erectors"],
                "suitable_diseases": ["Hypertension", "Anxiety", "Stress"],
                "imageUrl": "/assets/yoga/prasarita_padottanasana.jpg"
            },
            {
                "name": "Locust Pose",
                "sanskrit_name": "Salabhasana",
                "short_description": "A prone backbend that strengthens the lower back, glutes, and thighs.",
                "category": ["Beginner Yoga", "Back Pain", "Weight Loss", "Strength", "Flexibility"],
                "difficulty": "Beginner",
                "duration_sec": 60,
                "repetitions": 3,
                "calories_burned": 15.0,
                "benefits": [
                    "Strengthens back muscles, glutes, and hamstrings",
                    "Stimulates abdominal organs, helping digestion",
                    "Relieves lower back ache and sciatica pain"
                ],
                "step_by_step_instructions": [
                    "Lie flat on stomach, arms beside body, palms down.",
                    "Inhale, lift your head, chest, arms, and legs off the floor.",
                    "Keep legs straight and reach back through feet. Hold for 15-20 seconds. Repeat 3 times."
                ],
                "breathing_instructions": [
                    "Inhale as you lift legs and chest up.",
                    "Maintain normal, calm breathing while holding."
                ],
                "common_mistakes": ["Bending the knees", "Straining the neck by looking up too sharply"],
                "safety_precautions": ["Keep neck long and gaze slightly down to floor. Squeeze thighs together."],
                "avoid_if": ["Pregnancy", "Recent Abdominal/Back Surgery", "Severe Hernia"],
                "muscles_targeted": ["Gluteus Maximus", "Hamstrings", "Erector Spinae", "Deltoids"],
                "suitable_diseases": ["Back Pain", "Sciatica", "Obesity"],
                "imageUrl": "/assets/yoga/salabhasana.jpg"
            },
            {
                "name": "Crow Pose",
                "sanskrit_name": "Kakasana",
                "short_description": "A basic arm balance pose that builds wrist, arm, and core strength.",
                "category": ["Advanced Yoga", "Strength", "Office Yoga"],
                "difficulty": "Advanced",
                "duration_sec": 45,
                "repetitions": 2,
                "calories_burned": 25.0,
                "benefits": [
                    "Strengthens arms, wrists, shoulders, and core muscles",
                    "Stretches the upper back and inner groin",
                    "Improves coordination, focus, and balance"
                ],
                "step_by_step_instructions": [
                    "Squat down. Place palms flat on floor shoulder-width apart, fingers spread.",
                    "Bend elbows, place inner knees against outer triceps/shoulders.",
                    "Lean forward, shift weight into hands, slowly lift feet off floor. Hold 15-20 seconds."
                ],
                "breathing_instructions": [
                    "Exhale as you lean forward.",
                    "Breathe steadily and hold core tight to balance."
                ],
                "common_mistakes": ["Looking straight down at floor (look forward slightly to balance)", "Splaying elbows outward"],
                "safety_precautions": ["Place a pillow or cushion in front of head to catch you in case of falling forward"],
                "avoid_if": ["Carpal Tunnel Syndrome", "Wrist Injury", "Pregnancy", "Shoulder Injury"],
                "muscles_targeted": ["Triceps", "Anterior Deltoids", "Core Muscles", "Wrist Flexors"],
                "suitable_diseases": ["Joint Weakness"],
                "imageUrl": "/assets/yoga/kakasana.jpg"
            },
            {
                "name": "Crane Pose",
                "sanskrit_name": "Bakasana",
                "short_description": "An advanced arm balance where knees rest high into the armpits with straight arms.",
                "category": ["Advanced Yoga", "Strength"],
                "difficulty": "Advanced",
                "duration_sec": 45,
                "repetitions": 2,
                "calories_burned": 28.0,
                "benefits": [
                    "Builds extreme arm, shoulder, wrist, and core strength",
                    "Tones abdominal muscles",
                    "Develops concentration and balance control"
                ],
                "step_by_step_instructions": [
                    "Squat down. Place hands shoulder-width, fingers spread.",
                    "Place knees high up into armpits. Lean forward.",
                    "Squeeze core, lift hips high, straighten arms as much as possible. Lift feet. Hold 15 seconds."
                ],
                "breathing_instructions": [
                    "Keep breath steady; avoid holding breath during effort."
                ],
                "common_mistakes": ["Bending arms like Crow (Crane requires straighter arms)", "Allowing hips to drop low"],
                "safety_precautions": ["Ensure solid wrist strength before attempting. Use a wall for support."],
                "avoid_if": ["Carpal Tunnel Syndrome", "Pregnancy", "Wrist/Shoulder Injury", "Heart Problems"],
                "muscles_targeted": ["Pectorals", "Triceps", "Rectus Abdominis", "Serratus Anterior"],
                "suitable_diseases": ["Obesity"],
                "imageUrl": "/assets/yoga/bakasana.jpg"
            },
            {
                "name": "Monkey Pose",
                "sanskrit_name": "Hanumanasana",
                "short_description": "An advanced split posture that requires extreme hamstring and hip flexibility.",
                "category": ["Advanced Yoga", "Flexibility", "Sciatica"],
                "difficulty": "Advanced",
                "duration_sec": 60,
                "repetitions": 2,
                "calories_burned": 22.0,
                "benefits": [
                    "Deeply stretches hamstrings, groin, and hip flexors",
                    "Stimulates abdominal organs and stretches thigh muscles",
                    "Relieves sciatica stiffness over time"
                ],
                "step_by_step_instructions": [
                    "Kneel down. Step right foot forward. Slide left leg straight back.",
                    "Gradually slide right heel forward, keeping hips square, lowering pelvis toward floor.",
                    "Bring arms overhead in prayer. Hold for 20-30 seconds. Repeat on left side."
                ],
                "breathing_instructions": [
                    "Exhale deeply as you slide legs apart and sink down.",
                    "Breathe slowly to release muscle tension."
                ],
                "common_mistakes": ["Twisting hips sideways (keep hips square to front)", "Forcing split too fast"],
                "safety_precautions": ["Use yoga blocks under hands/hips to support body weight if split is not full"],
                "avoid_if": ["Groin Tear", "Severe Hamstring Injury", "Sciatica (acute)"],
                "muscles_targeted": ["Hamstrings", "Quadriceps", "Iliopsoas", "Adductors"],
                "suitable_diseases": ["Sciatica", "Joint Stiffness"],
                "imageUrl": "/assets/yoga/hanumanasana.jpg"
            },
            {
                "name": "One-Legged King Pigeon Pose",
                "sanskrit_name": "Eka Pada Rajakapotasana",
                "short_description": "An advanced deep hip opener and backbend that opens chest and releases emotional stress.",
                "category": ["Advanced Yoga", "Flexibility", "Stress Relief", "Anxiety", "Sciatica"],
                "difficulty": "Advanced",
                "duration_sec": 90,
                "repetitions": 2,
                "calories_burned": 24.0,
                "benefits": [
                    "Deeply opens outer hip rotators (piriformis) and stretches groin",
                    "Stretches abdomen, chest, and shoulder muscles",
                    "Releases mental anxiety and accumulated stress in hips"
                ],
                "step_by_step_instructions": [
                    "From Downward Dog, bring right knee forward to floor behind right wrist. Right shin diagonally.",
                    "Slide left leg straight back, top of foot on floor.",
                    "Keep hips square. Walk hands back, lift chest (or fold forward over front leg). Hold 30s. Repeat."
                ],
                "breathing_instructions": [
                    "Deep breathing into the hips on each exhale to release glute tightness."
                ],
                "common_mistakes": ["Allowing hips to collapse to right side", "Bending front knee beyond knee comfort range"],
                "safety_precautions": ["Place a block or blanket under right hip if it does not touch the floor"],
                "avoid_if": ["Severe Knee Injury", "Sacroiliac Joint Dysfunction", "Recent Hip Surgery"],
                "muscles_targeted": ["Piriformis", "Gluteus Medius", "Iliopsoas", "Chest Muscles"],
                "suitable_diseases": ["Sciatica", "Stress", "Anxiety"],
                "imageUrl": "/assets/yoga/eka_pada_rajakapotasana.jpg"
            }
        ]

        # Seed data, matching key field names
        for item in yogas:
            collection.update_one({"name": item['name']}, {"$set": item}, upsert=True)
        print(f"Yoga Pose collection seeded successfully with {len(yogas)} poses.")

if __name__ == '__main__':
    from database.db import init_db
    init_db()
    Yoga.seed_data()
