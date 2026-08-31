from bson import ObjectId
from database.db import get_db

class Disease:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['diseaseguides']

    @classmethod
    def get_all(cls, search=""):
        collection = cls.get_collection()
        try:
            if collection.count_documents({}) == 0:
                cls.seed_data()
        except Exception:
            pass
        if search:
            return list(collection.find({"name": {"$regex": search, "$options": "i"}}))
        return list(collection.find({}))

    @classmethod
    def find_by_name(cls, name):
        return cls.get_collection().find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})

    @classmethod
    def find_by_id(cls, disease_id):
        if isinstance(disease_id, str):
            disease_id = ObjectId(disease_id)
        return cls.get_collection().find_one({"_id": disease_id})

    @classmethod
    def create(cls, data):
        collection = cls.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @classmethod
    def seed_data(cls):
        """Seed the database with comprehensive disease and nutrition information."""
        collection = cls.get_collection()
        try:
            collection.drop_index("disease_1")
        except Exception:
            pass
        
        diseases = [
            {
                "name": "Diabetes",
                "overview": "A chronic condition that affects how the body processes blood sugar (glucose).",
                "symptoms": ["Increased thirst", "Frequent urination", "Extreme hunger", "Unexplained weight loss", "Fatigue"],
                "foods_to_eat": ["Leafy greens", "Fatty fish (salmon, sardines)", "Chia seeds", "Beans and lentils", "Greek yogurt", "Nuts", "Broccoli", "Garlic"],
                "foods_to_avoid": ["Sugar-sweetened beverages", "Trans fats", "White bread, pasta, and rice", "Fruit-flavored yogurt", "Sweetened breakfast cereals", "Honey, agave nectar, and maple syrup"],
                "lifestyle_advice": "Monitor blood sugar regularly, stay hydrated, maintain a consistent eating schedule, and manage stress.",
                "exercise": "30 minutes of moderate aerobic exercise (brisk walking, swimming) at least 5 days a week.",
                "yoga": "Dhanurasana (Bow Pose), Paschimottanasana (Seated Forward Bend), Ardha Matsyendrasana (Half Fish Pose).",
                "doctor_consultation_advice": "Consult an endocrinologist and a registered dietitian to construct a personalized insulin and meal plan."
            },
            {
                "name": "Hypertension",
                "overview": "A condition in which the force of the blood against the artery walls is too high (High Blood Pressure).",
                "symptoms": ["Headaches", "Shortness of breath", "Nosebleeds", "Flushing", "Dizziness", "Chest pain"],
                "foods_to_eat": ["Leafy green vegetables", "Berries (blueberries, strawberries)", "Red beets", "Skim milk and yogurt", "Oatmeal", "Bananas", "Salmon and mackerel", "Seeds (sunflower, pumpkin)"],
                "foods_to_avoid": ["Salt and sodium-heavy foods", "Deli meats", "Frozen pizzas", "Pickles", "Canned soups", "Tomato products", "Chicken skin and packaged foods"],
                "lifestyle_advice": "Reduce sodium intake (DASH diet), limit alcohol consumption, quit smoking, and ensure adequate sleep.",
                "exercise": "Cardio exercises like brisk walking, cycling, or climbing stairs for 30-40 minutes daily.",
                "yoga": "Shavasana (Corpse Pose), Sukhasana (Easy Pose), Bhramari Pranayama (Humming Bee Breath).",
                "doctor_consultation_advice": "Regular blood pressure check-ups are recommended. Consult a cardiologist for medication adjustments if BP exceeds 130/80 mmHg."
            },
            {
                "name": "Obesity",
                "overview": "A complex disease involving an excessive amount of body fat, raising the risk of other health problems.",
                "symptoms": ["Shortness of breath", "Increased sweating", "Snoring", "Inability to cope with sudden physical activity", "Extreme fatigue"],
                "foods_to_eat": ["Whole grains (oats, brown rice)", "Fresh fruits and vegetables", "Lean proteins (chicken breast, tofu)", "Water, herbal teas", "Legumes and pulses"],
                "foods_to_avoid": ["Fast foods", "Highly processed snacks (chips, cookies)", "Refined grains", "High-sugar desserts", "Processed meats (sausages, bacon)"],
                "lifestyle_advice": "Log daily food intake, practice mindful eating, prioritize portion control, and establish a consistent sleep cycle.",
                "exercise": "At least 150 minutes of moderate-intensity physical activity per week, combining strength training and cardio.",
                "yoga": "Surya Namaskar (Sun Salutation), Trikonasana (Triangle Pose), Virabhadrasana (Warrior Pose).",
                "doctor_consultation_advice": "Consult a physician or bariatric specialist to screen for underlying metabolic or thyroid issues."
            },
            {
                "name": "PCOS",
                "overview": "Polycystic Ovary Syndrome is a hormonal disorder common among women of reproductive age.",
                "symptoms": ["Irregular periods", "Excess androgen (acne, excess facial hair)", "Polycystic ovaries on ultrasound", "Weight gain", "Thinning hair"],
                "foods_to_eat": ["High-fiber foods (beans, broccoli)", "Lean proteins", "Anti-inflammatory foods (berries, tomatoes, olive oil)", "Spinach", "Almonds and walnuts", "Whole grains"],
                "foods_to_avoid": ["Refined carbohydrates", "Sugary snacks and drinks", "Inflammatory foods (red meat, margarine)", "Dairy products (if sensitive)"],
                "lifestyle_advice": "Focus on insulin sensitivity. Maintain a low glycemic index diet, eat smaller frequent meals, and reduce stress levels.",
                "exercise": "High-Intensity Interval Training (HIIT) combined with strength training 3-4 times a week.",
                "yoga": "Badha Konasana (Butterfly Pose), Supta Badha Konasana (Reclined Butterfly Pose), Bhujangasana (Cobra Pose).",
                "doctor_consultation_advice": "Consult a gynecologist or endocrinologist to monitor insulin, thyroid, and reproductive hormone levels regularly."
            },
            {
                "name": "PCOD",
                "overview": "Polycystic Ovarian Disease is a medical condition in which a woman’s ovaries produce immature or partially mature eggs, which eventually turn into cysts.",
                "symptoms": ["Irregular periods", "Abdominal weight gain", "Acne and oily skin", "Excessive facial and body hair growth (hirsutism)", "Thinning hair"],
                "foods_to_eat": ["High-fiber vegetables (broccoli, cauliflower)", "Lean proteins (fish, chicken, tofu)", "Anti-inflammatory foods (tomatoes, berries, olive oil)", "Nuts and seeds", "Legumes and pulses"],
                "foods_to_avoid": ["Refined carbohydrates (white bread, pastries)", "Sugary snacks and beverages", "Processed meats", "Saturated fats"],
                "lifestyle_advice": "Maintain a consistent sleeping pattern, manage stress levels, focus on weight management, and avoid skipped meals to keep blood sugar stable.",
                "exercise": "30-45 minutes of moderate exercise like brisk walking, cycling, or light resistance training 4-5 times a week.",
                "yoga": "Badha Konasana (Butterfly Pose), Supta Badha Konasana (Reclined Butterfly Pose), Bhujangasana (Cobra Pose).",
                "doctor_consultation_advice": "Consult a gynecologist and a nutritionist to outline a lifestyle management plan and regular hormone level monitoring."
            },
            {
                "name": "Thyroid (Hypothyroidism)",
                "overview": "A condition in which the thyroid gland doesn't produce enough thyroid hormone, slowing metabolism.",
                "symptoms": ["Fatigue", "Weight gain", "Cold intolerance", "Constipation", "Dry skin", "Muscle weakness"],
                "foods_to_eat": ["Iodized salt", "Eggs", "Meats (chicken, beef)", "Fish and seafood", "Vegetables (except raw cruciferous)", "Gluten-free grains"],
                "foods_to_avoid": ["Soy-based foods (tofu, edamame)", "Raw cruciferous vegetables (broccoli, cabbage, kale)", "Gluten", "Processed snacks", "Excessive caffeine"],
                "lifestyle_advice": "Take thyroid medication on an empty stomach in the morning. Stay warm and hydrated. Get routine blood tests.",
                "exercise": "Low-impact aerobics, walking, and muscle-strengthening exercises 30 minutes a day.",
                "yoga": "Sarvangasana (Shoulder Stand), Halasana (Plow Pose), Ustrasana (Camel Pose), Matsyasana (Fish Pose).",
                "doctor_consultation_advice": "Consult an endocrinologist for regular TSH, Free T3, and Free T4 tests and dose corrections."
            },
            {
                "name": "Thyroid (Hyperthyroidism)",
                "overview": "A condition where the thyroid gland produces too much thyroid hormone, accelerating the body's metabolism.",
                "symptoms": ["Unintentional weight loss", "Rapid heartbeat (tachycardia)", "Anxiety and irritability", "Sweating and heat intolerance", "Muscle weakness"],
                "foods_to_eat": ["Cruciferous vegetables (cabbage, broccoli)", "Berries", "Calcium-rich foods", "Turmeric", "Healthy fats (extra virgin olive oil)"],
                "foods_to_avoid": ["Iodized salt & seafood", "Excessive dairy", "Soy products", "High-glycemic processed foods", "Caffeine"],
                "lifestyle_advice": "Manage stress, get adequate rest, eat smaller calorie-dense meals, and avoid high-iodine foods.",
                "exercise": "Light cardiovascular exercises and gentle stretching to avoid putting excessive stress on the heart.",
                "yoga": "Shitali Pranayama (Cooling Breath), Balasana (Child's Pose), Viparita Karani (Legs-up-the-wall Pose).",
                "doctor_consultation_advice": "Regular endocrinology checks are essential to monitor Free T3 and T4 levels and adjust antithyroid drug dosages."
            },
            {
                "name": "Asthma & COPD",
                "overview": "Chronic inflammatory diseases of the airways that cause breathing difficulties, airflow limitation, and wheezing.",
                "symptoms": ["Shortness of breath", "Wheezing", "Chest tightness", "Chronic cough", "Mucus production"],
                "foods_to_eat": ["Vitamin D-rich foods (egg yolks, fortified foods)", "Omega-3 rich foods", "Apples and bananas (rich in antioxidants)", "Carrots & leafy greens", "Ginger and garlic"],
                "foods_to_avoid": ["Sulfites (found in dried fruit, wine)", "Processed meats", "Gas-inducing foods (beans, carbonated drinks)", "Very cold foods/beverages"],
                "lifestyle_advice": "Avoid environmental triggers like smoke, dust, pollen, and pet dander. Maintain good indoor air quality.",
                "exercise": "Gentle aerobics, swimming (in non-chlorinated pools), and walking, accompanied by proper warm-ups.",
                "yoga": "Nadi Shodhana Pranayama (Alternate Nostril Breathing), Sukhasana (Easy Pose), Bhujangasana (Cobra Pose).",
                "doctor_consultation_advice": "Consult a pulmonologist for a personalized Asthma Action Plan, and always carry rescue inhalers."
            },
            {
                "name": "GERD (Acid Reflux)",
                "overview": "A digestive disorder that occurs when acidic stomach juices, or food and fluids, back up from the stomach into the esophagus.",
                "symptoms": ["Heartburn after eating", "Chest pain", "Difficulty swallowing", "Regurgitation of sour liquid", "Sensation of a lump in the throat"],
                "foods_to_eat": ["Non-citrus fruits (melons, bananas, pears)", "Oatmeal and whole grains", "Lean meats (chicken, turkey, fish)", "Ginger", "Root vegetables (sweet potatoes, carrots)"],
                "foods_to_avoid": ["Citrus fruits (oranges, lemons)", "Tomatoes and tomato-based sauces", "Chocolate and peppermint", "Fried and fatty foods", "Spicy foods", "Carbonated beverages and caffeine"],
                "lifestyle_advice": "Eat smaller meals, avoid lying down for 3 hours after eating, elevate the head of the bed, and avoid tight-fitting clothing.",
                "exercise": "Moderate exercises like walking or cycling. Avoid heavy lifting or intense jogging right after meals.",
                "yoga": "Vajrasana (Thunderbolt Pose), Pawanmuktasana (Wind-Relieving Pose), Marjariasana (Cat-Cow Stretch).",
                "doctor_consultation_advice": "Consult a gastroenterologist if symptoms persist despite lifestyle adjustments, to discuss acid reducers."
            },
            {
                "name": "Irritable Bowel Syndrome (IBS)",
                "overview": "A common disorder that affects the large intestine, causing cramping, abdominal pain, bloating, gas, and changes in bowel habits.",
                "symptoms": ["Abdominal cramping or pain", "Bloating and gas", "Diarrhea or constipation (sometimes alternating)", "Mucus in stool"],
                "foods_to_eat": ["Low-FODMAP foods (oats, quinoa, rice)", "Lean proteins", "Non-cruciferous vegetables (zucchini, cucumber)", "Lactose-free dairy or alternatives", "Berries"],
                "foods_to_avoid": ["High-FODMAP foods (garlic, onions, beans, wheat)", "Lactose-heavy foods", "Artificial sweeteners (sorbitol, xylitol)", "Cruciferous vegetables", "Carbonated drinks"],
                "lifestyle_advice": "Maintain a food diary, practice stress-reducing activities, eat at regular times, and chew food thoroughly.",
                "exercise": "Moderate activities like brisk walking, yoga, and swimming which help regulate bowel motility and reduce stress.",
                "yoga": "Pawanmuktasana (Wind-Relieving Pose), Ardha Matsyendrasana (Half Spinal Twist), Balasana (Child's Pose).",
                "doctor_consultation_advice": "Consult a gastroenterologist or a specialized GI dietitian to formulate a structured low-FODMAP diet plan."
            },
            {
                "name": "Gout (High Uric Acid)",
                "overview": "A painful form of inflammatory arthritis characterized by sudden, severe attacks of pain, swelling, and redness in the joints, often the big toe.",
                "symptoms": ["Intense joint pain", "Lingering discomfort", "Inflammation and redness", "Limited range of motion in the affected joint"],
                "foods_to_eat": ["Low-fat dairy products", "Cherries and cherry juice", "Vegetable-based proteins (tofu, legumes)", "Whole grains", "Plenty of water", "Coffee (in moderation)"],
                "foods_to_avoid": ["Organ meats (liver, kidneys)", "Red meat (beef, pork, lamb)", "Seafood (shellfish, anchovies)", "Alcohol (especially beer)", "High-fructose corn syrup and sugary drinks"],
                "lifestyle_advice": "Stay highly hydrated (helps flush uric acid), limit purine-rich foods, avoid rapid weight loss diets, and keep joint elevated during flares.",
                "exercise": "Low-impact exercises like swimming or water aerobics to keep joints mobile without putting weight pressure.",
                "yoga": "Tadasana (Mountain Pose), Uttanasana (Standing Forward Fold), Virabhadrasana I (Warrior I Pose).",
                "doctor_consultation_advice": "Consult a rheumatologist for uric-acid lowering medication and acute flare management."
            },
            {
                "name": "Chronic Kidney Disease (CKD)",
                "overview": "The gradual loss of kidney function over time, leading to dangerous levels of fluid, electrolytes, and wastes building up in the body.",
                "symptoms": ["Nausea and vomiting", "Loss of appetite", "Fatigue and weakness", "Sleep problems", "Swelling of feet and ankles", "Persistent itching"],
                "foods_to_eat": ["Low-protein, high-quality proteins (in early stages)", "Cabbage and cauliflower", "Blueberries and red grapes", "Garlic and onions", "White rice and pasta (dietitian-approved)"],
                "foods_to_avoid": ["High-sodium foods", "High-potassium foods (bananas, oranges, potatoes)", "High-phosphorus foods (dairy, dark sodas, nuts)", "Excessive protein"],
                "lifestyle_advice": "Carefully monitor daily fluid intake, limit sodium strictly, track blood pressure, and review all medications with a doctor.",
                "exercise": "Mild, regular physical activities like walking or light cycling for 20-30 minutes, keeping exertion levels low.",
                "yoga": "Ardha Matsyendrasana (Half Spinal Twist), Bhujangasana (Cobra Pose), Shavasana (Corpse Pose).",
                "doctor_consultation_advice": "Consult a nephrologist and a renal dietitian regularly to customize your diet based on GFR and electrolyte levels."
            },
            {
                "name": "Iron Deficiency Anemia",
                "overview": "A condition in which blood lacks adequate healthy red blood cells due to insufficient iron, resulting in reduced oxygen delivery to tissues.",
                "symptoms": ["Extreme fatigue and weakness", "Pale skin", "Cold hands and feet", "Dizziness or lightheadedness", "Chest pain or fast heartbeat"],
                "foods_to_eat": ["Red meat, pork, and poultry", "Seafood", "Beans and dark green leafy vegetables (spinach)", "Iron-fortified cereals and bread", "Vitamin C rich foods (citrus, tomatoes) to enhance iron absorption"],
                "foods_to_avoid": ["Tea and coffee (tannins inhibit iron absorption)", "Calcium-rich foods (when eaten at the same time as iron)", "Whole grain cereals containing phytates"],
                "lifestyle_advice": "Combine iron-rich foods with vitamin C sources. Avoid drinking tea/coffee with or immediately after meals.",
                "exercise": "Start slowly with light activities like walking, gradually increasing duration as hemoglobin levels and energy improve.",
                "yoga": "Sarvangasana (Shoulder Stand), Trikonasana (Triangle Pose), Shavasana (Corpse Pose).",
                "doctor_consultation_advice": "Consult a primary care physician to check ferritin levels and determine the need for oral iron supplementation."
            },
            {
                "name": "Fatty Liver Disease (NAFLD)",
                "overview": "An accumulation of excess fat in liver cells not caused by alcohol, which can lead to liver inflammation and scarring (cirrhosis) if unmanaged.",
                "symptoms": ["Often asymptomatic", "Fatigue", "Pain or discomfort in the upper right abdomen", "Abdominal swelling (ascites) in advanced stages"],
                "foods_to_eat": ["Mediterranean diet style foods", "Olive oil and avocados", "Tofu and soy protein", "Garlic and green tea", "Leafy green vegetables", "Whole grains (oats)"],
                "foods_to_avoid": ["High-fructose corn syrup and sugary sweets", "Trans fats and saturated fats", "Alcohol", "Processed grains and white breads", "Fried foods"],
                "lifestyle_advice": "Aim for gradual weight loss (7-10% body weight), maintain normal lipid levels, control blood sugar, and avoid hepatotoxic drugs.",
                "exercise": "A combination of aerobic exercise and resistance training (30-60 minutes, 4-5 days a week).",
                "yoga": "Dhanurasana (Bow Pose), Ardha Matsyendrasana (Half Spinal Twist), Kapalabhati Pranayama (Breath of Fire).",
                "doctor_consultation_advice": "Consult a hepatologist or gastroenterologist for liver enzyme monitoring (AST/ALT) and fibroscans."
            },
            {
                "name": "Arthritis (Osteo & Rheumatoid)",
                "overview": "Inflammatory or degenerative conditions affecting the joints, leading to pain, swelling, stiffness, and reduced mobility.",
                "symptoms": ["Joint pain and stiffness", "Swelling, redness, and warmth", "Decreased range of motion", "Deformity of joints (in advanced rheumatoid arthritis)"],
                "foods_to_eat": ["Fatty fish (rich in omega-3)", "Olive oil", "Ginger and turmeric (natural anti-inflammatory)", "Garlic", "Berries and cherries", "Walnuts and flaxseeds"],
                "foods_to_avoid": ["Refined carbohydrates and sugar", "Saturated and trans fats", "Processed meats", "Excess salt", "Alcohol"],
                "lifestyle_advice": "Apply hot/cold therapy, maintain a healthy weight to reduce joint load, use assistive devices when needed, and balance rest with activity.",
                "exercise": "Low-impact exercises (walking, swimming, water therapy) and joint-friendly stretching to maintain flexibility.",
                "yoga": "Vrikshasana (Tree Pose), Sukhasana (Easy Pose), Bhujangasana (Cobra Pose).",
                "doctor_consultation_advice": "Consult a rheumatologist or orthopedist to manage joint damage and explore pharmacological treatments."
            },
            {
                "name": "Osteoporosis",
                "overview": "A condition in which bones become weak, brittle, and fragile, making them highly susceptible to fractures from minor falls or stresses.",
                "symptoms": ["Back pain, caused by a fractured or collapsed vertebra", "Loss of height over time", "A stooped posture", "A bone that breaks much more easily than expected"],
                "foods_to_eat": ["Calcium-rich foods (dairy products, fortified plant milks)", "Dark green leafy vegetables (kale, collard greens)", "Salmon and sardines (with bones)", "Vitamin D-fortified foods", "Nuts and seeds"],
                "foods_to_avoid": ["Caffeine", "Salty foods (sodium drains calcium)", "High-phosphorus sodas (colas)", "Excessive alcohol"],
                "lifestyle_advice": "Ensure adequate exposure to sunlight (for Vitamin D), prevent fall hazards at home, and avoid smoking.",
                "exercise": "Weight-bearing exercises (walking, dancing, low-impact aerobics) and strength training to stimulate bone density.",
                "yoga": "Tadasana (Mountain Pose), Vrikshasana (Tree Pose), Virabhadrasana II (Warrior II Pose).",
                "doctor_consultation_advice": "Consult an endocrinologist or rheumatologist to perform DEXA scans and discuss bone-building therapies."
            },
            {
                "name": "Migraine & Headaches",
                "overview": "A neurological condition characterized by intense, debilitating headaches, often accompanied by sensory disturbances.",
                "symptoms": ["Severe throbbing headache, usually on one side", "Sensitivity to light, sound, and smell", "Nausea and vomiting", "Visual disturbances or auras"],
                "foods_to_eat": ["Magnesium-rich foods (spinach, almonds, avocados)", "Ginger tea (helps nausea and pain)", "Fatty fish", "Coenzyme Q10 rich foods (beef, sesame seeds)", "Plenty of water to avoid dehydration"],
                "foods_to_avoid": ["Aged cheeses (contain tyramine)", "Processed meats containing nitrates", "Artificial sweeteners (aspartame)", "MSG (monosodium glutamate)", "Chocolate and red wine", "Caffeine fluctuations"],
                "lifestyle_advice": "Establish a consistent sleep schedule, eat meals at regular times, reduce stress through relaxation techniques, and stay hydrated.",
                "exercise": "Light to moderate aerobic exercise like walking. Avoid sudden, high-intensity workouts which can trigger a migraine.",
                "yoga": "Balasana (Child's Pose), Adho Mukha Svanasana (Downward-Facing Dog), Shavasana (Corpse Pose).",
                "doctor_consultation_advice": "Consult a neurologist to determine headache triggers and formulate a plan for preventive and abortive medications."
            },
            {
                "name": "Celiac Disease",
                "overview": "A serious autoimmune disorder where eating gluten leads to damage in the small intestine, blocking nutrient absorption.",
                "symptoms": ["Chronic diarrhea or constipation", "Abdominal bloating and pain", "Weight loss and malabsorption", "Fatigue", "Anemia", "Itchy skin rash (dermatitis herpetiformis)"],
                "foods_to_eat": ["Naturally gluten-free grains (quinoa, brown rice, millet, buckwheat)", "Fresh fruits and vegetables", "Fresh meats, poultry, and fish", "Eggs and dairy", "Legumes, nuts, and seeds"],
                "foods_to_avoid": ["Wheat, barley, rye, and triticale", "Breads, pasta, cakes, and cereals containing gluten", "Processed sauces, gravies, and soups (unless labeled gluten-free)", "Beer and malted beverages"],
                "lifestyle_advice": "Thoroughly read food labels, prevent cross-contamination in the kitchen, use separate toaster/utensils, and eat out with caution.",
                "exercise": "Regular physical activity of your choice to boost energy levels, strengthen bones (combating malabsorption osteoporosis), and elevate mood.",
                "yoga": "Trikonasana (Triangle Pose), Bhujangasana (Cobra Pose), Paschimottanasana (Seated Forward Bend).",
                "doctor_consultation_advice": "Consult a gastroenterologist and a registered dietitian specializing in gluten-free diets to ensure complete intestinal healing."
            },
            {
                "name": "Cardiovascular / Coronary Artery Disease (CAD)",
                "overview": "A narrowing or blockage of the coronary arteries, usually caused by plaque buildup, reducing blood flow to the heart.",
                "symptoms": ["Chest pain or discomfort (angina)", "Shortness of breath", "Fatigue with exertion", "Pain in the jaw, neck, back, or arms", "Dizziness"],
                "foods_to_eat": ["Omega-3 fatty acids (salmon, walnuts, flaxseeds)", "Oats, barley, and high-fiber foods", "Berries and citrus fruits", "Leafy greens", "Extra virgin olive oil", "Garlic and green tea"],
                "foods_to_avoid": ["Saturated and trans fats", "Deep-fried foods", "Highly processed meats (hot dogs, cold cuts)", "High-sodium foods", "Refined sugars and sodas"],
                "lifestyle_advice": "Quit smoking, maintain a healthy weight, manage stress (e.g. mindfulness), get regular blood pressure and lipid checks, and limit alcohol.",
                "exercise": "At least 30 minutes of moderate-intensity aerobic exercise (walking, cycling) 5 days a week, after cardiac clearance.",
                "yoga": "Shavasana (Corpse Pose), Sukhasana (Easy Pose), Anulom Vilom Pranayama (Alternate Nostril Breathing).",
                "doctor_consultation_advice": "Regular consults with a cardiologist. Immediately seek emergency care for severe chest pain or sudden shortness of breath."
            },
            {
                "name": "Anxiety & Depression",
                "overview": "Common but serious mood disorders that affect how you feel, think, and handle daily activities, involving persistent sadness, worry, or loss of interest.",
                "symptoms": ["Persistent feelings of sadness, anxiety, or emptiness", "Loss of interest in hobbies", "Fatigue and lack of energy", "Difficulty concentrating", "Changes in appetite or weight", "Irritability"],
                "foods_to_eat": ["Tryptophan-rich foods (turkey, eggs, cheese)", "Complex carbohydrates (oats, whole grains)", "Omega-3 rich foods", "Fermented foods (kefir, yogurt for gut-brain axis)", "Dark chocolate (in moderation)", "Berries"],
                "foods_to_avoid": ["Alcohol and recreational drugs", "Excessive caffeine (can mimic or trigger anxiety)", "Refined sugar (causes blood sugar crashes)", "Highly processed foods"],
                "lifestyle_advice": "Establish a consistent sleep hygiene routine, practice mindfulness or meditation, maintain social connections, and keep a gratitude journal.",
                "exercise": "30-45 minutes of aerobic exercise (running, dancing, hiking) which releases endorphins and acts as a natural mood lifter.",
                "yoga": "Balasana (Child's Pose), Viparita Karani (Legs-up-the-wall Pose), Sethu Bandhasana (Bridge Pose), Bhramari Pranayama.",
                "doctor_consultation_advice": "Consult a psychiatrist or licensed therapist for a combination of counseling (CBT) and potential medical therapy."
            },
            {
                "name": "Chronic Insomnia",
                "overview": "A common sleep disorder that makes it hard to fall asleep, hard to stay asleep, or causes you to wake up too early and not be able to get back to sleep.",
                "symptoms": ["Difficulty falling asleep at night", "Waking up during the night or waking up too early", "Not feeling well-rested after a night's sleep", "Daytime tiredness or sleepiness", "Irritability, depression, or anxiety"],
                "foods_to_eat": ["Kiwi fruit (contains serotonin)", "Tart cherry juice", "Almonds and walnuts (contain melatonin/magnesium)", "Warm milk or chamomile tea", "Bananas (magnesium and potassium)"],
                "foods_to_avoid": ["Caffeine in the afternoon or evening", "Alcohol (disrupts REM sleep)", "Heavy, spicy, or high-fat meals close to bedtime", "Excessive fluids before sleep"],
                "lifestyle_advice": "Keep a strict sleep schedule, turn off screens 1 hour before bed, keep the bedroom cool and dark, and avoid daytime napping.",
                "exercise": "Regular exercise during the day, preferably in the morning or afternoon. Avoid vigorous workouts within 3 hours of sleep.",
                "yoga": "Viparita Karani (Legs-up-the-wall Pose), Balasana (Child's Pose), Shavasana (Corpse Pose), Chandra Bhedana Pranayama (Left Nostril Breathing).",
                "doctor_consultation_advice": "Consult a sleep specialist or primary care doctor if insomnia impairs daytime functioning for more than 4 weeks."
            },
            {
                "name": "Rickets",
                "overview": "A skeletal disorder caused by a lack of vitamin D, calcium, or phosphate, leading to softening and weakening of bones.",
                "symptoms": ["Delayed growth", "Bow legs or knock knees", "Pain in the spine, pelvis, and legs", "Muscle weakness", "Softened skull bones (craniotabes)"],
                "foods_to_eat": ["Fortified milk and orange juice", "Egg yolks", "Fatty fish (salmon, tuna, mackerel)", "Sardines", "Cheese and yogurt", "Fortified cereals"],
                "foods_to_avoid": ["High-phytate foods (unrefined grains without soaking)", "High-oxalate vegetables in excess", "Carbonated soft drinks (high phosphate)", "Excessive salt"],
                "lifestyle_advice": "Get 15-20 minutes of daily natural morning sunlight exposure. Ensure balanced calcium and Vitamin D co-supplementation under medical guidance.",
                "exercise": "Gentle weight-bearing activities (walking, light play) as tolerated to encourage bone mineralization without risking fractures.",
                "yoga": "Tadasana (Mountain Pose), Vrikshasana (Tree Pose), Bhujangasana (Cobra Pose).",
                "doctor_consultation_advice": "Consult a pediatrician or endocrinologist for serum 25-hydroxyvitamin D tests and bone X-rays."
            },
            {
                "name": "Deficiency Illnesses (Nutritional Deficiencies)",
                "overview": "Conditions arising from inadequate intake, poor absorption, or excessive loss of essential vitamins (B12, D, C) and minerals (Iron, Zinc, Iodine).",
                "symptoms": ["Chronic fatigue and weakness", "Brittle hair and nails", "Mouth ulcers or swollen tongue", "Poor night vision", "Impaired immunity and slow wound healing"],
                "foods_to_eat": ["Nutrient-dense whole foods", "Eggs and organ meats", "Leafy green vegetables (spinach, kale)", "Nuts and seeds (pumpkin, sesame)", "Fortified nutritional yeast", "Citrus fruits"],
                "foods_to_avoid": ["Empty-calorie ultra-processed foods", "Sugary sodas", "Excessive alcohol", "Junk foods with high calorie but low nutrient density"],
                "lifestyle_advice": "Eat a colorful rainbow diet (5+ servings of veggies/fruits daily). Get periodic blood micronutrient screenings.",
                "exercise": "Moderate exercise (30 mins daily) to boost metabolism, nutrient uptake, and circulation.",
                "yoga": "Surya Namaskar (Sun Salutation), Sarvangasana (Shoulder Stand), Paschimottanasana (Seated Forward Bend).",
                "doctor_consultation_advice": "Consult a nutritionist or clinical physician to run a comprehensive micronutrient panel and tailor therapeutic supplementation."
            },
            {
                "name": "Metabolic Disorders (Metabolic Syndrome)",
                "overview": "A cluster of conditions — including increased blood pressure, high blood sugar, excess body fat around the waist, and abnormal cholesterol levels — that occur together, increasing risk of heart disease, stroke, and type 2 diabetes.",
                "symptoms": ["Large waist circumference (apple body shape)", "High fasting blood sugar", "Increased thirst and urination", "Fatigue", "Acanthosis nigricans (darkened skin on neck/axilla)"],
                "foods_to_eat": ["High-fiber legumes and beans", "Whole oats and quinoa", "Avocados and extra virgin olive oil", "Fatty fish (omega-3)", "Berries and walnuts"],
                "foods_to_avoid": ["Trans fats and hydrogenated oils", "Refined carbohydrates (white flour, white rice)", "Sugary beverages and syrups", "Processed fast foods"],
                "lifestyle_advice": "Achieve a 5-10% weight loss, engage in daily movement, reduce stress, and maintain a consistent circadian sleep schedule.",
                "exercise": "150 minutes of weekly aerobic cardio paired with 2 sessions of progressive resistance strength training.",
                "yoga": "Dhanurasana (Bow Pose), Mandukasana (Frog Pose), Ardha Matsyendrasana (Half Spinal Twist).",
                "doctor_consultation_advice": "Regular monitoring of lipid panels, HbA1c, and blood pressure with an endocrinologist or metabolic health doctor."
            },
            {
                "name": "Chronic Conditions & Fatigue",
                "overview": "Prolonged health conditions requiring ongoing medical attention, energy pacing, and specialized lifestyle modulation to maintain vitality and prevent burnout.",
                "symptoms": ["Unrefreshing sleep", "Post-exertional malaise (PEM)", "Brain fog and memory difficulty", "Muscle and joint pain", "Flu-like feeling"],
                "foods_to_eat": ["Anti-inflammatory whole foods", "Magnesium-rich dark leafy greens", "Clean proteins (wild salmon, chicken, tofu)", "Bone broth", "Hydrating cucumber and coconut water"],
                "foods_to_avoid": ["Refined sugars (trigger energy crashes)", "Artificial additives and preservatives", "Excessive caffeine", "Alcohol", "Processed fast food"],
                "lifestyle_advice": "Practice activity pacing (avoid push-crash cycles), optimize sleep hygiene, practice deep meditation, and listen to body signals.",
                "exercise": "Low-impact restorative movement (gentle stretching, light walking) strictly keeping within heart rate energy envelopes.",
                "yoga": "Viparita Karani (Legs-up-the-wall Pose), Balasana (Child's Pose), Shavasana (Corpse Pose), Pranayama.",
                "doctor_consultation_advice": "Collaborate with an integrative physician or chronic care team to manage symptom flares and energy envelope thresholds."
            },
            {
                "name": "Influenza (Flu)",
                "overview": "A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs.",
                "symptoms": ["High fever and chills", "Severe body aches and muscle soreness", "Dry cough and sore throat", "Extreme fatigue and exhaustion", "Headache and congestion"],
                "foods_to_eat": ["Hot chicken or vegetable soup", "Warm ginger and honey tea", "Vitamin C-rich fruits (oranges, kiwi, berries)", "Garlic and turmeric broth", "Electrolyte-rich fluids"],
                "foods_to_avoid": ["Cold, sugary drinks", "Heavy, greasy, fried foods", "Dairy products (if increasing mucus)", "Alcohol and caffeinated drinks (dehydrating)"],
                "lifestyle_advice": "Get strict bed rest, stay thoroughly hydrated, isolate to prevent spread, and use a humidifier in your bedroom.",
                "exercise": "Avoid exercise during acute fever and body aches. Resume gentle walking only after fever subsides for 48 hours.",
                "yoga": "Supported Setu Bandhasana (Bridge Pose), Supta Baddha Konasana (Reclined Bound Angle), Deep Diaphragmatic Breathing.",
                "doctor_consultation_advice": "Consult a doctor early for antiviral treatment (e.g. Oseltamivir) if at high risk of flu complications."
            },
            {
                "name": "Urinary Tract Infections (UTI)",
                "overview": "An infection in any part of the urinary system (kidneys, ureters, bladder, and urethra), most commonly involving the lower urinary tract.",
                "symptoms": ["Strong, persistent urge to urinate", "Burning sensation during urination (dysuria)", "Cloudy or strong-smelling urine", "Pelvic pain in women", "Passing frequent, small amounts of urine"],
                "foods_to_eat": ["Unsweetened pure cranberry juice", "Plenty of water (at least 3 Liters/day)", "Probiotic-rich yogurt and kefir", "Blueberries and raspberries", "Garlic and cucumber"],
                "foods_to_avoid": ["Caffeine (coffee, energy drinks)", "Alcohol", "Spicy foods", "Artificial sweeteners", "Acidic citrus fruits (during acute inflammation)"],
                "lifestyle_advice": "Drink abundant water to flush bacteria, wipe front to back, urinate immediately after intercourse, and do not hold urine.",
                "exercise": "Light walking. Avoid heavy pelvic strain, intense squatting, or swimming in unchlorinated water during active infection.",
                "yoga": "Baddha Konasana (Butterfly Pose), Malasana (Garland Pose), Viparita Karani (Legs-up-the-wall Pose).",
                "doctor_consultation_advice": "Consult a primary physician or urologist for urine culture test and targeted antibiotic therapy."
            },
            {
                "name": "Acid Reflux (GERD & Heartburn)",
                "overview": "A gastrointestinal disorder where stomach acid repeatedly flows back into the tube connecting your mouth and stomach (esophagus), causing irritation and heartburn.",
                "symptoms": ["Burning sensation in chest (heartburn), usually after eating", "Regurgitation of food or sour liquid", "Upper abdominal or chest pain", "Difficulty swallowing (dysphagia)", "Sensation of a lump in your throat"],
                "foods_to_eat": ["Oatmeal and non-citrus fruits (bananas, melons)", "Lean poultry and fish", "Steamed green vegetables", "Ginger tea", "Almond milk"],
                "foods_to_avoid": ["Fried and fatty foods", "Tomatoes and citrus fruits", "Chocolate and mint", "Onions and garlic", "Carbonated beverages and coffee", "Alcohol"],
                "lifestyle_advice": "Eat smaller meals, avoid lying down for 3 hours after eating, elevate the head of your bed 6 inches, and wear loose-fitting clothing around the waist.",
                "exercise": "Upright low-impact activities like walking. Avoid inversions, intense abdominal crunches, or heavy lifting right after meals.",
                "yoga": "Vajrasana (Thunderbolt Pose - right after meals), Tadasana (Mountain Pose), Virabhadrasana (Warrior Pose).",
                "doctor_consultation_advice": "Consult a gastroenterologist if heartburn occurs more than twice a week or if swallowing becomes painful."
            },
            {
                "name": "Gastroenteritis (Stomach Flu)",
                "overview": "An intestinal infection marked by watery diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever, often caused by viruses or contaminated food.",
                "symptoms": ["Watery, non-bloody diarrhea", "Nausea and frequent vomiting", "Abdominal cramps and pain", "Low-grade fever", "Muscle aches and dehydration"],
                "foods_to_eat": ["BRAT diet (Bananas, Rice, Applesauce, Toast)", "Oral Rehydration Solutions (ORS)", "Clear chicken/vegetable broth", "Plain crackers", "Boiled potatoes"],
                "foods_to_avoid": ["Dairy products (milk, cheese)", "High-fat, greasy, or fried foods", "Spicy foods", "Caffeine and alcohol", "High-sugar fruit juices"],
                "lifestyle_advice": "Sip ORS or water frequently in small amounts, rest your stomach for a few hours after vomiting, wash hands thoroughly, and rest in bed.",
                "exercise": "Rest completely until fully recovered and rehydrated. Resume gentle activities gradually.",
                "yoga": "Balasana (Child's Pose), Pawanmuktasana (Wind-Relieving Pose - when recovering), Shavasana (Corpse Pose).",
                "doctor_consultation_advice": "Seek urgent medical care if unable to keep liquids down for 24 hours, or if signs of severe dehydration or bloody stool appear."
            }
        ]

        for item in diseases:
            collection.update_one({"name": item['name']}, {"$set": item}, upsert=True)
        print("Disease Guide collection seeded successfully.")
