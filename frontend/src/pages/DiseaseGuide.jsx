import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';
import { TbYoga } from 'react-icons/tb';
import toast from 'react-hot-toast';
import YogaCard from '../components/yoga/YogaCard';
import PoseDetails from '../components/yoga/PoseDetails';

export const DiseaseGuide = () => {
  const [diseases, setDiseases] = useState([]);
  const [medicines, setMedicines] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medTab, setMedTab] = useState('related'); // 'related' or 'all'
  const [medSearch, setMedSearch] = useState('');
  const [diseaseYogas, setDiseaseYogas] = useState([]);
  const [activeModalPose, setActiveModalPose] = useState(null);

  const fetchGuideData = async () => {
    setLoading(true);
    let list = [];
    try {
      const diseaseRes = await api.get(`/guide/diseases?search=${encodeURIComponent(search)}`);
      list = diseaseRes.data?.diseases || (Array.isArray(diseaseRes.data) ? diseaseRes.data : []);
    } catch (err) {
      console.error("Error fetching diseases from API:", err);
    }

    if (!list || list.length === 0) {
      // Complete fallback disease list for all 29 health conditions
      list = [
        {
          _id: "dis_1",
          name: "Diabetes",
          overview: "A chronic condition that affects how the body processes blood sugar (glucose).",
          symptoms: ["Increased thirst", "Frequent urination", "Extreme hunger", "Unexplained weight loss", "Fatigue"],
          foods_to_eat: ["Leafy greens", "Fatty fish (salmon, sardines)", "Chia seeds", "Beans and lentils", "Greek yogurt", "Broccoli", "Garlic"],
          foods_to_avoid: ["Sugar-sweetened beverages", "Trans fats", "White bread, pasta, and rice", "Sweetened cereals", "Honey and syrups"],
          lifestyle_advice: "Monitor blood sugar regularly, stay hydrated, maintain a consistent eating schedule, and manage stress.",
          exercise: "30 minutes of moderate aerobic exercise (brisk walking, swimming) at least 5 days a week.",
          yoga: "Dhanurasana (Bow Pose), Paschimottanasana (Seated Forward Bend), Ardha Matsyendrasana (Half Fish Pose).",
          doctor_consultation_advice: "Consult an endocrinologist and a registered dietitian to construct a personalized insulin and meal plan."
        },
        {
          _id: "dis_2",
          name: "Hypertension",
          overview: "A condition in which the force of the blood against the artery walls is too high (High Blood Pressure).",
          symptoms: ["Headaches", "Shortness of breath", "Nosebleeds", "Flushing", "Dizziness", "Chest pain"],
          foods_to_eat: ["Leafy green vegetables", "Berries (blueberries, strawberries)", "Red beets", "Skim milk and yogurt", "Oatmeal", "Bananas"],
          foods_to_avoid: ["Salt and sodium-heavy foods", "Deli meats", "Frozen pizzas", "Pickles", "Canned soups", "Packaged snacks"],
          lifestyle_advice: "Reduce sodium intake (DASH diet), limit alcohol consumption, quit smoking, and ensure adequate sleep.",
          exercise: "Cardio exercises like brisk walking, cycling, or climbing stairs for 30-40 minutes daily.",
          yoga: "Shavasana (Corpse Pose), Sukhasana (Easy Pose), Bhramari Pranayama (Humming Bee Breath).",
          doctor_consultation_advice: "Regular blood pressure check-ups are recommended. Consult a cardiologist for medication adjustments if BP exceeds 130/80 mmHg."
        },
        {
          _id: "dis_3",
          name: "Obesity",
          overview: "A complex disease involving an excessive amount of body fat, raising the risk of other health problems.",
          symptoms: ["Shortness of breath", "Increased sweating", "Snoring", "Fatigue"],
          foods_to_eat: ["Whole grains (oats, brown rice)", "Fresh fruits and vegetables", "Lean proteins (chicken breast, tofu)", "Legumes and pulses"],
          foods_to_avoid: ["Fast foods", "Highly processed snacks (chips, cookies)", "Refined grains", "High-sugar desserts"],
          lifestyle_advice: "Log daily food intake, practice mindful eating, prioritize portion control, and establish a consistent sleep cycle.",
          exercise: "At least 150 minutes of moderate-intensity physical activity per week, combining strength training and cardio.",
          yoga: "Surya Namaskar (Sun Salutation), Trikonasana (Triangle Pose), Virabhadrasana (Warrior Pose).",
          doctor_consultation_advice: "Consult a physician or bariatric specialist to screen for underlying metabolic or thyroid issues."
        },
        {
          _id: "dis_4",
          name: "PCOS",
          overview: "Polycystic Ovary Syndrome is a hormonal disorder common among women of reproductive age.",
          symptoms: ["Irregular periods", "Excess androgen (acne, excess facial hair)", "Polycystic ovaries on ultrasound", "Weight gain"],
          foods_to_eat: ["High-fiber foods (beans, broccoli)", "Lean proteins", "Anti-inflammatory foods (berries, tomatoes, olive oil)", "Spinach", "Almonds"],
          foods_to_avoid: ["Refined carbohydrates", "Sugary snacks and drinks", "Inflammatory foods (red meat, margarine)", "Dairy products"],
          lifestyle_advice: "Focus on insulin sensitivity. Maintain a low glycemic index diet, eat smaller frequent meals, and reduce stress levels.",
          exercise: "High-Intensity Interval Training (HIIT) combined with strength training 3-4 times a week.",
          yoga: "Badha Konasana (Butterfly Pose), Supta Badha Konasana (Reclined Butterfly Pose), Bhujangasana (Cobra Pose).",
          doctor_consultation_advice: "Consult a gynecologist or endocrinologist to monitor insulin, thyroid, and reproductive hormone levels regularly."
        },
        {
          _id: "dis_5",
          name: "PCOD",
          overview: "Polycystic Ovarian Disease is a medical condition in which ovaries produce immature eggs turning into cysts.",
          symptoms: ["Irregular periods", "Abdominal weight gain", "Acne and oily skin", "Excessive facial hair", "Thinning hair"],
          foods_to_eat: ["High-fiber vegetables", "Lean proteins", "Anti-inflammatory foods", "Nuts and seeds", "Legumes"],
          foods_to_avoid: ["Refined carbs", "Sugary beverages", "Processed meats", "Saturated fats"],
          lifestyle_advice: "Maintain a consistent sleeping pattern, manage stress levels, focus on weight management, and avoid skipped meals.",
          exercise: "30-45 minutes of moderate exercise like brisk walking, cycling, or light resistance training 4-5 times a week.",
          yoga: "Badha Konasana (Butterfly Pose), Supta Badha Konasana, Bhujangasana.",
          doctor_consultation_advice: "Consult a gynecologist and a nutritionist to outline a lifestyle management plan."
        },
        {
          _id: "dis_6",
          name: "Cardiovascular / Coronary Artery Disease (CAD)",
          overview: "A narrowing or blockage of the coronary arteries, usually caused by plaque buildup, reducing blood flow to the heart.",
          symptoms: ["Chest pain or discomfort (angina)", "Shortness of breath", "Fatigue with exertion", "Dizziness"],
          foods_to_eat: ["Omega-3 fatty acids (salmon, walnuts, flaxseeds)", "Oats, barley, and high-fiber foods", "Berries and citrus fruits", "Leafy greens"],
          foods_to_avoid: ["Saturated and trans fats", "Deep-fried foods", "Highly processed meats", "High-sodium foods", "Refined sugars"],
          lifestyle_advice: "Quit smoking, maintain a healthy weight, manage stress, get regular BP and lipid checks, and limit alcohol.",
          exercise: "At least 30 minutes of moderate-intensity aerobic exercise (walking, cycling) 5 days a week.",
          yoga: "Shavasana (Corpse Pose), Sukhasana (Easy Pose), Anulom Vilom Pranayama.",
          doctor_consultation_advice: "Regular consults with a cardiologist. Immediately seek emergency care for severe chest pain."
        },
        {
          _id: "dis_7",
          name: "Rickets",
          overview: "A skeletal disorder caused by a lack of vitamin D, calcium, or phosphate, leading to softening and weakening of bones.",
          symptoms: ["Delayed growth", "Bow legs or knock knees", "Pain in spine and legs", "Muscle weakness"],
          foods_to_eat: ["Fortified milk and orange juice", "Egg yolks", "Fatty fish (salmon, tuna)", "Cheese and yogurt"],
          foods_to_avoid: ["High-phytate foods", "High-oxalate vegetables in excess", "Carbonated soft drinks", "Excessive salt"],
          lifestyle_advice: "Get 15-20 minutes of daily natural morning sunlight exposure. Ensure calcium and Vitamin D co-supplementation.",
          exercise: "Gentle weight-bearing activities (walking, light play) as tolerated to encourage bone mineralization.",
          yoga: "Tadasana (Mountain Pose), Vrikshasana (Tree Pose), Bhujangasana (Cobra Pose).",
          doctor_consultation_advice: "Consult a pediatrician or endocrinologist for serum Vitamin D tests and bone X-rays."
        },
        {
          _id: "dis_8",
          name: "Deficiency Illnesses (Nutritional Deficiencies)",
          overview: "Conditions arising from inadequate intake, poor absorption, or excessive loss of essential vitamins and minerals.",
          symptoms: ["Chronic fatigue and weakness", "Brittle hair and nails", "Mouth ulcers", "Poor night vision", "Impaired immunity"],
          foods_to_eat: ["Nutrient-dense whole foods", "Eggs and organ meats", "Leafy green vegetables", "Nuts and seeds", "Citrus fruits"],
          foods_to_avoid: ["Empty-calorie ultra-processed foods", "Sugary sodas", "Excessive alcohol", "Junk foods"],
          lifestyle_advice: "Eat a colorful rainbow diet (5+ servings of veggies/fruits daily). Get periodic blood micronutrient screenings.",
          exercise: "Moderate exercise (30 mins daily) to boost metabolism, nutrient uptake, and circulation.",
          yoga: "Surya Namaskar (Sun Salutation), Sarvangasana, Paschimottanasana.",
          doctor_consultation_advice: "Consult a nutritionist or physician to run a comprehensive micronutrient panel."
        },
        {
          _id: "dis_9",
          name: "Metabolic Disorders (Metabolic Syndrome)",
          overview: "A cluster of conditions including high BP, high blood sugar, excess waist body fat, and abnormal cholesterol levels.",
          symptoms: ["Large waist circumference", "High fasting blood sugar", "Increased thirst and urination", "Fatigue"],
          foods_to_eat: ["High-fiber legumes and beans", "Whole oats and quinoa", "Avocados and olive oil", "Fatty fish", "Walnuts"],
          foods_to_avoid: ["Trans fats", "Refined carbohydrates", "Sugary beverages", "Processed fast foods"],
          lifestyle_advice: "Achieve a 5-10% weight loss, engage in daily movement, reduce stress, and maintain consistent sleep.",
          exercise: "150 minutes of weekly aerobic cardio paired with 2 sessions of progressive resistance strength training.",
          yoga: "Dhanurasana (Bow Pose), Mandukasana (Frog Pose), Ardha Matsyendrasana.",
          doctor_consultation_advice: "Regular monitoring of lipid panels, HbA1c, and blood pressure with an endocrinologist."
        },
        {
          _id: "dis_10",
          name: "Chronic Conditions & Fatigue",
          overview: "Prolonged health conditions requiring ongoing medical attention, energy pacing, and specialized lifestyle modulation.",
          symptoms: ["Unrefreshing sleep", "Post-exertional malaise", "Brain fog", "Muscle and joint pain", "Flu-like feeling"],
          foods_to_eat: ["Anti-inflammatory whole foods", "Magnesium-rich dark greens", "Clean proteins (salmon, chicken, tofu)", "Bone broth"],
          foods_to_avoid: ["Refined sugars", "Artificial additives", "Excessive caffeine", "Alcohol", "Processed fast food"],
          lifestyle_advice: "Practice activity pacing, optimize sleep hygiene, practice deep meditation, and listen to body signals.",
          exercise: "Low-impact restorative movement strictly keeping within heart rate energy envelopes.",
          yoga: "Viparita Karani, Balasana, Shavasana, Pranayama.",
          doctor_consultation_advice: "Collaborate with an integrative physician or chronic care team."
        },
        {
          _id: "dis_11",
          name: "Influenza (Flu)",
          overview: "A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.",
          symptoms: ["High fever and chills", "Severe body aches", "Dry cough and sore throat", "Extreme fatigue", "Headache"],
          foods_to_eat: ["Hot chicken or vegetable soup", "Warm ginger tea with honey", "Vitamin C fruits", "Garlic and turmeric broth"],
          foods_to_avoid: ["Cold sugary drinks", "Heavy greasy fried foods", "Dairy products", "Alcohol and caffeine"],
          lifestyle_advice: "Get strict bed rest, stay thoroughly hydrated, isolate to prevent spread, and use a humidifier.",
          exercise: "Avoid exercise during acute fever and body aches. Resume gentle walking only after fever subsides.",
          yoga: "Supported Setu Bandhasana, Supta Baddha Konasana, Deep Diaphragmatic Breathing.",
          doctor_consultation_advice: "Consult a doctor early for antiviral treatment if at high risk of flu complications."
        },
        {
          _id: "dis_12",
          name: "Urinary Tract Infections (UTI)",
          overview: "An infection in any part of the urinary system (kidneys, ureters, bladder, and urethra).",
          symptoms: ["Strong urge to urinate", "Burning sensation during urination", "Cloudy or strong-smelling urine", "Pelvic pain"],
          foods_to_eat: ["Unsweetened pure cranberry juice", "Plenty of water (at least 3L/day)", "Probiotic yogurt", "Blueberries"],
          foods_to_avoid: ["Caffeine", "Alcohol", "Spicy foods", "Artificial sweeteners", "Acidic citrus fruits during flare"],
          lifestyle_advice: "Drink abundant water to flush bacteria, wipe front to back, urinate after intercourse, and don't hold urine.",
          exercise: "Light walking. Avoid heavy pelvic strain or swimming in unchlorinated water during active infection.",
          yoga: "Baddha Konasana (Butterfly Pose), Malasana (Garland Pose), Viparita Karani.",
          doctor_consultation_advice: "Consult a physician or urologist for urine culture test and targeted antibiotic therapy."
        },
        {
          _id: "dis_13",
          name: "Acid Reflux (GERD & Heartburn)",
          overview: "A gastrointestinal disorder where stomach acid repeatedly flows back into the esophagus, causing heartburn.",
          symptoms: ["Burning sensation in chest (heartburn)", "Regurgitation of sour liquid", "Chest pain", "Difficulty swallowing"],
          foods_to_eat: ["Oatmeal and non-citrus fruits", "Lean poultry and fish", "Steamed green vegetables", "Ginger tea", "Almond milk"],
          foods_to_avoid: ["Fried and fatty foods", "Tomatoes and citrus fruits", "Chocolate and mint", "Onions and garlic", "Carbonated drinks"],
          lifestyle_advice: "Eat smaller meals, avoid lying down for 3 hours after eating, elevate bed head 6 inches, and wear loose clothing.",
          exercise: "Upright low-impact activities like walking. Avoid inversions or heavy lifting right after meals.",
          yoga: "Vajrasana (Thunderbolt Pose - after meals), Tadasana, Virabhadrasana.",
          doctor_consultation_advice: "Consult a gastroenterologist if heartburn occurs more than twice a week."
        },
        {
          _id: "dis_14",
          name: "Gastroenteritis (Stomach Flu)",
          overview: "An intestinal infection marked by watery diarrhea, abdominal cramps, nausea, vomiting, and fever.",
          symptoms: ["Watery diarrhea", "Nausea and frequent vomiting", "Abdominal cramps", "Low-grade fever", "Dehydration"],
          foods_to_eat: ["BRAT diet (Bananas, Rice, Applesauce, Toast)", "Oral Rehydration Solutions (ORS)", "Clear chicken broth", "Crackers"],
          foods_to_avoid: ["Dairy products", "High-fat or fried foods", "Spicy foods", "Caffeine and alcohol"],
          lifestyle_advice: "Sip ORS frequently, rest stomach after vomiting, wash hands thoroughly, and rest in bed.",
          exercise: "Rest completely until fully recovered and rehydrated. Resume gentle activities gradually.",
          yoga: "Balasana (Child's Pose), Pawanmuktasana, Shavasana.",
          doctor_consultation_advice: "Seek urgent medical care if unable to keep liquids down for 24 hours or if dehydrated."
        },
        {
          _id: "dis_15",
          name: "Iron Deficiency Anemia",
          overview: "A condition in which blood lacks adequate healthy red blood cells due to insufficient iron.",
          symptoms: ["Extreme fatigue and weakness", "Pale skin", "Cold hands and feet", "Dizziness", "Shortness of breath"],
          foods_to_eat: ["Red meat, pork, and poultry", "Seafood", "Dark green leafy vegetables (spinach)", "Vitamin C foods"],
          foods_to_avoid: ["Tea and coffee with meals", "Calcium-rich foods at the same time as iron", "Unsoaked grains"],
          lifestyle_advice: "Combine iron-rich foods with vitamin C sources. Avoid drinking tea/coffee immediately after meals.",
          exercise: "Start slowly with light activities like walking, gradually increasing duration as energy improves.",
          yoga: "Sarvangasana (Shoulder Stand), Trikonasana (Triangle Pose), Shavasana.",
          doctor_consultation_advice: "Consult a primary physician to check ferritin levels and discuss oral iron supplementation."
        },
        {
          _id: "dis_16",
          name: "Asthma & COPD",
          overview: "Chronic inflammatory lung diseases causing narrowed airways, wheezing, and shortness of breath.",
          symptoms: ["Shortness of breath", "Chest tightness", "Wheezing", "Chronic cough"],
          foods_to_eat: ["Vitamin D rich foods", "Apples and cantaloupe", "Carrots and leafy greens", "Omega-3 rich fish"],
          foods_to_avoid: ["Sulfites (dried fruits, wine)", "Gas-causing foods (beans, carbonated drinks)", "Artificial preservatives"],
          lifestyle_advice: "Identify and avoid air triggers (smoke, pollen, dust). Use air purifiers and maintain clean indoor air.",
          exercise: "Breathing-controlled activities like walking, swimming in warm humid environments.",
          yoga: "Anulom Vilom Pranayama, Bhujangasana, Matsyasana (Fish Pose).",
          doctor_consultation_advice: "Work with a pulmonologist to maintain a personal Asthma Action Plan and inhaler regimen."
        },
        {
          _id: "dis_17",
          name: "Thyroid (Hypothyroidism)",
          overview: "Underactive thyroid gland that doesn't produce enough crucial thyroid hormones, slowing metabolism.",
          symptoms: ["Fatigue", "Increased sensitivity to cold", "Constipation", "Dry skin", "Weight gain", "Puffy face"],
          foods_to_eat: ["Iodized salt", "Brazil nuts (selenium)", "Eggs", "Dairy products", "Fish"],
          foods_to_avoid: ["Raw cruciferous vegetables in large amounts (cabbage, broccoli)", "Soy products close to medication", "Gluten"],
          lifestyle_advice: "Take thyroid medication on an empty stomach 30-60 minutes before breakfast. Get regular TSH level checks.",
          exercise: "30 minutes of low-impact aerobic exercise combined with strength training 4-5 times a week.",
          yoga: "Sarvangasana (Shoulder Stand), Matsyasana (Fish Pose), Ustrasana (Camel Pose).",
          doctor_consultation_advice: "Consult an endocrinologist for dosage calibration of levothyroxine."
        },
        {
          _id: "dis_18",
          name: "Fatty Liver Disease (NAFLD)",
          overview: "Accumulation of excess fat in liver cells not caused by alcohol, leading to liver inflammation if unmanaged.",
          symptoms: ["Fatigue", "Pain in upper right abdomen", "Abdominal swelling"],
          foods_to_eat: ["Olive oil and avocados", "Tofu and soy protein", "Garlic and green tea", "Leafy green vegetables", "Oats"],
          foods_to_avoid: ["High-fructose corn syrup", "Trans fats and saturated fats", "Alcohol", "White breads and sugary sweets"],
          lifestyle_advice: "Aim for gradual weight loss (7-10%), control blood sugar, and avoid hepatotoxic substances.",
          exercise: "Combination of aerobic exercise and resistance training for 30-60 minutes 4-5 days a week.",
          yoga: "Dhanurasana (Bow Pose), Ardha Matsyendrasana, Kapalabhati Pranayama.",
          doctor_consultation_advice: "Consult a gastroenterologist or hepatologist for liver enzyme monitoring (AST/ALT)."
        },
        {
          _id: "dis_19",
          name: "Irritable Bowel Syndrome (IBS)",
          overview: "A common disorder that affects the large intestine, causing cramping, abdominal pain, bloating, and gas.",
          symptoms: ["Abdominal cramping or pain", "Bloating and gas", "Diarrhea or constipation", "Mucus in stool"],
          foods_to_eat: ["Low-FODMAP foods (oats, quinoa, rice)", "Lean proteins", "Zucchini, cucumber", "Berries"],
          foods_to_avoid: ["High-FODMAP foods (garlic, onions, beans, wheat)", "Lactose-heavy foods", "Artificial sweeteners", "Carbonated drinks"],
          lifestyle_advice: "Maintain a food diary, practice stress reduction, eat at regular times, and chew food thoroughly.",
          exercise: "Moderate activities like brisk walking, yoga, and swimming which help regulate bowel motility.",
          yoga: "Pawanmuktasana, Ardha Matsyendrasana, Balasana (Child's Pose).",
          doctor_consultation_advice: "Consult a gastroenterologist or GI dietitian to formulate a structured low-FODMAP plan."
        },
        {
          _id: "dis_20",
          name: "Arthritis (Osteo & Rheumatoid)",
          overview: "Inflammatory or degenerative conditions affecting joints, leading to pain, swelling, stiffness, and reduced mobility.",
          symptoms: ["Joint pain and stiffness", "Swelling and redness", "Decreased range of motion", "Joint deformity"],
          foods_to_eat: ["Fatty fish (salmon, mackerel)", "Olive oil", "Ginger and turmeric", "Garlic", "Berries and cherries", "Walnuts"],
          foods_to_avoid: ["Refined carbs and sugar", "Saturated fats", "Processed meats", "Excess salt", "Alcohol"],
          lifestyle_advice: "Apply hot/cold therapy, maintain healthy weight, use joint supports, and balance rest with activity.",
          exercise: "Low-impact exercises (swimming, water therapy, walking) to maintain joint flexibility.",
          yoga: "Vrikshasana (Tree Pose), Sukhasana, Bhujangasana.",
          doctor_consultation_advice: "Consult a rheumatologist or orthopedist to manage joint inflammation."
        },
        {
          _id: "dis_21",
          name: "Osteoporosis",
          overview: "A condition in which bones become weak, brittle, and fragile, making them susceptible to fractures.",
          symptoms: ["Back pain from collapsed vertebra", "Loss of height", "Stooped posture", "Bone breaks easily"],
          foods_to_eat: ["Calcium-rich dairy", "Dark leafy greens (kale)", "Salmon and sardines", "Vitamin D foods", "Nuts"],
          foods_to_avoid: ["Caffeine", "Salty foods", "Colas and carbonated soft drinks", "Excessive alcohol"],
          lifestyle_advice: "Ensure sunlight exposure for Vitamin D, prevent fall hazards at home, and avoid smoking.",
          exercise: "Weight-bearing exercises (walking, low-impact aerobics) and light strength training.",
          yoga: "Tadasana, Vrikshasana, Virabhadrasana II.",
          doctor_consultation_advice: "Consult an endocrinologist for DEXA bone density scans."
        },
        {
          _id: "dis_22",
          name: "Gout (High Uric Acid)",
          overview: "A painful form of inflammatory arthritis characterized by sudden severe attacks of pain and swelling in joints.",
          symptoms: ["Intense joint pain (often big toe)", "Lingering discomfort", "Inflammation and redness", "Limited range of motion"],
          foods_to_eat: ["Low-fat dairy products", "Cherries and cherry juice", "Tofu and legumes", "Whole grains", "Water"],
          foods_to_avoid: ["Organ meats", "Red meat", "Seafood (shellfish, anchovies)", "Alcohol (especially beer)", "High-fructose drinks"],
          lifestyle_advice: "Stay highly hydrated to flush uric acid, limit purine foods, avoid crash diets, and elevate joint during flares.",
          exercise: "Low-impact exercises like swimming or water aerobics to keep joints mobile.",
          yoga: "Tadasana, Uttanasana, Virabhadrasana I.",
          doctor_consultation_advice: "Consult a rheumatologist for uric-acid lowering medication."
        },
        {
          _id: "dis_23",
          name: "Chronic Kidney Disease (CKD)",
          overview: "Gradual loss of kidney function over time, leading to dangerous build-up of fluid, electrolytes, and waste.",
          symptoms: ["Nausea and vomiting", "Loss of appetite", "Fatigue", "Swelling of feet and ankles", "Persistent itching"],
          foods_to_eat: ["Controlled high-quality proteins", "Cabbage and cauliflower", "Blueberries and red grapes", "Garlic and onions", "Rice"],
          foods_to_avoid: ["High-sodium foods", "High-potassium foods (bananas, potatoes)", "High-phosphorus foods (dairy, colas)", "Excess protein"],
          lifestyle_advice: "Carefully monitor daily fluid intake, limit sodium strictly, track BP, and review all medications.",
          exercise: "Mild, regular physical activities like walking or light cycling for 20-30 minutes.",
          yoga: "Ardha Matsyendrasana, Bhujangasana, Shavasana.",
          doctor_consultation_advice: "Consult a nephrologist and renal dietitian regularly based on GFR levels."
        },
        {
          _id: "dis_24",
          name: "Migraine & Headaches",
          overview: "A neurological condition characterized by intense, debilitating headaches and sensory disturbances.",
          symptoms: ["Severe throbbing headache on one side", "Sensitivity to light, sound, smell", "Nausea and vomiting", "Visual auras"],
          foods_to_eat: ["Magnesium-rich foods (spinach, almonds, avocados)", "Ginger tea", "Fatty fish", "Plenty of water"],
          foods_to_avoid: ["Aged cheeses", "Processed meats with nitrates", "Artificial sweeteners", "MSG", "Red wine", "Caffeine shifts"],
          lifestyle_advice: "Keep a consistent sleep schedule, eat regular meals, reduce stress, and stay hydrated.",
          exercise: "Light to moderate aerobic exercise like walking. Avoid sudden high-intensity bursts.",
          yoga: "Balasana (Child's Pose), Adho Mukha Svanasana, Shavasana.",
          doctor_consultation_advice: "Consult a neurologist to determine headache triggers and preventive therapies."
        },
        {
          _id: "dis_25",
          name: "Celiac Disease",
          overview: "An autoimmune disorder where eating gluten leads to small intestine damage, blocking nutrient absorption.",
          symptoms: ["Chronic diarrhea or constipation", "Abdominal bloating", "Weight loss", "Fatigue", "Anemia", "Itchy skin rash"],
          foods_to_eat: ["Naturally gluten-free grains (quinoa, brown rice, millet)", "Fresh fruits and vegetables", "Fresh meats, fish", "Eggs"],
          foods_to_avoid: ["Wheat, barley, rye, triticale", "Breads, pasta, cakes containing gluten", "Processed gravies and beer"],
          lifestyle_advice: "Thoroughly read food labels, prevent kitchen cross-contamination, and eat out with caution.",
          exercise: "Regular physical activity to boost energy levels and strengthen bones.",
          yoga: "Trikonasana, Bhujangasana, Paschimottanasana.",
          doctor_consultation_advice: "Consult a gastroenterologist and a registered dietitian specializing in gluten-free diets."
        },
        {
          _id: "dis_26",
          name: "Anxiety & Depression",
          overview: "Common mood disorders affecting how you feel, think, and handle daily activities, involving persistent sadness or worry.",
          symptoms: ["Persistent feelings of sadness or anxiety", "Loss of interest in hobbies", "Fatigue", "Difficulty concentrating"],
          foods_to_eat: ["Tryptophan-rich foods (turkey, eggs)", "Complex carbohydrates (oats)", "Omega-3 rich foods", "Fermented foods", "Dark chocolate"],
          foods_to_avoid: ["Alcohol", "Excessive caffeine", "Refined sugar", "Highly processed junk food"],
          lifestyle_advice: "Establish a consistent sleep routine, practice mindfulness, maintain social connections, and keep a gratitude journal.",
          exercise: "30-45 minutes of aerobic exercise (running, dancing, walking) which releases natural endorphins.",
          yoga: "Balasana, Viparita Karani, Sethu Bandhasana, Bhramari Pranayama.",
          doctor_consultation_advice: "Consult a psychiatrist or licensed therapist for counseling and therapy options."
        },
        {
          _id: "dis_27",
          name: "Chronic Insomnia",
          overview: "A common sleep disorder that makes it hard to fall asleep, stay asleep, or causes early awakening.",
          symptoms: ["Difficulty falling asleep", "Waking up during night", "Not feeling well-rested", "Daytime fatigue", "Irritability"],
          foods_to_eat: ["Kiwi fruit", "Tart cherry juice", "Almonds and walnuts", "Warm milk or chamomile tea", "Bananas"],
          foods_to_avoid: ["Caffeine in afternoon/evening", "Alcohol", "Heavy spicy meals close to bed", "Excessive fluid before sleep"],
          lifestyle_advice: "Keep a strict sleep schedule, turn off screens 1 hour before bed, keep room cool, and avoid daytime napping.",
          exercise: "Regular daytime exercise. Avoid vigorous workouts within 3 hours of sleep.",
          yoga: "Viparita Karani, Balasana, Shavasana, Chandra Bhedana Pranayama.",
          doctor_consultation_advice: "Consult a sleep specialist or primary doctor if insomnia persists over 4 weeks."
        }
      ];

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(d => 
          d.name.toLowerCase().includes(q) || 
          d.overview.toLowerCase().includes(q) || 
          d.symptoms.some(s => s.toLowerCase().includes(q))
        );
      }
    }

    setDiseases(list);
    if (list.length > 0) {
      setSelectedDisease(list[0]);
    } else {
      setSelectedDisease(null);
    }

    try {
      const medicineRes = await api.get('/guide/medicines');
      setMedicines(medicineRes.data);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackYogasForDisease = (dis) => {
    if (!dis) return [];
    const name = dis.name || '';
    const yogaText = dis.yoga || '';
    
    return [
      {
        _id: `yoga_dis_1_${name}`,
        name: yogaText.split(',')[0] || "Cobra Pose",
        sanskrit_name: "Bhujangasana",
        difficulty: "Beginner",
        duration_sec: 30,
        calories_burned: 12.0,
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
        short_description: `Relieves stress, enhances spinal flexibility, and improves organ circulation specifically beneficial for ${name}.`,
        step_by_step_instructions: [
          "Lie flat on your stomach with feet together and palms placed under your shoulders.",
          "Inhale deeply, gently lift your chest off the mat, keeping your navel close to the ground.",
          "Roll shoulders back, engage your core, and hold the posture while breathing steadily.",
          "Exhale slowly as you gently lower your chest back to the floor."
        ],
        breathing_instructions: [
          "Inhale as you raise your chest and upper torso.",
          "Hold the pose with normal, steady, deep breathing.",
          "Exhale smoothly as you release the posture."
        ],
        benefits: [
          `Specifically alleviates symptoms associated with ${name}`,
          "Strengthens spinal extensors and shoulders",
          "Stimulates abdominal digestive organs and endocrine glands"
        ]
      },
      {
        _id: `yoga_dis_2_${name}`,
        name: yogaText.split(',')[1] || "Butterfly Pose",
        sanskrit_name: "Baddha Konasana",
        difficulty: "Beginner",
        duration_sec: 45,
        calories_burned: 10.0,
        imageUrl: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80",
        short_description: `Promotes deep pelvic and abdominal blood circulation for ${name} relief.`,
        step_by_step_instructions: [
          "Sit upright with your spine straight and legs extended out.",
          "Bend your knees and draw the soles of your feet together close to your pelvis.",
          "Hold your feet gently with both hands and flutter your knees up and down rhythmically.",
          "Keep your chest lifted and maintain slow, deep breathing throughout."
        ],
        breathing_instructions: [
          "Deep inhale to lengthen the spine.",
          "Rhythmic, calm breathing while gently flexing knees."
        ],
        benefits: [
          `Promotes targeted physiological balance for ${name}`,
          "Increases hip and pelvic flexibility",
          "Calms the mind and relieves tension"
        ]
      }
    ];
  };

  useEffect(() => {
    fetchGuideData();
  }, [search]);

  useEffect(() => {
    if (selectedDisease?.name) {
      api.get(`/guide/yogas?disease=${encodeURIComponent(selectedDisease.name)}`)
        .then(res => {
          const yogas = res.data?.yogas || [];
          if (yogas.length > 0) {
            setDiseaseYogas(yogas);
          } else {
            setDiseaseYogas(getFallbackYogasForDisease(selectedDisease));
          }
        })
        .catch(err => {
          console.error("Error fetching disease yogas:", err);
          setDiseaseYogas(getFallbackYogasForDisease(selectedDisease));
        });
    } else {
      setDiseaseYogas([]);
    }
  }, [selectedDisease]);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Medical Disease & Nutrition Guide</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Scientific advice on foods to eat, foods to avoid, and habits for major health conditions.</p>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Directory Search List */}
        <div className="space-y-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Search diseases..."
            />
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl overflow-hidden shadow-soft divide-y divide-gray-100 dark:divide-gray-800 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {loading && diseases.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading guide directory...</div>
            ) : diseases.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No diseases found matching.</div>
            ) : (
              diseases.map((dis) => (
                <div
                  key={dis._id}
                  onClick={() => {
                    setSelectedDisease(dis);
                    setMedTab('related');
                  }}
                  className={`p-4 cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedDisease?.name === dis.name 
                      ? 'bg-green-500/10 hover:bg-green-500/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <HiOutlineHeart className={`w-5 h-5 ${selectedDisease?.name === dis.name ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{dis.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Disease details or Medicine guidelines */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDisease && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-6">
              
              {/* Heading */}
              <div>
                <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{selectedDisease.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-2 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100/50 dark:border-gray-800">
                  {selectedDisease.overview}
                </p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Common Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDisease.symptoms?.map((sym, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-lg font-semibold">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diet guides: Eat vs Avoid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50/20 dark:bg-green-950/5 p-5 rounded-2xl border border-green-100/10 dark:border-green-800/10">
                  <h4 className="font-bold text-green-700 dark:text-green-400 text-sm mb-3 flex items-center gap-1.5">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                    <span>Foods to Eat</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    {selectedDisease.foods_to_eat?.map((food, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/20 dark:bg-red-950/5 p-5 rounded-2xl border border-red-100/10 dark:border-red-800/10">
                  <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-3 flex items-center gap-1.5">
                    <HiOutlineXCircle className="w-5 h-5" />
                    <span>Foods to Avoid</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    {selectedDisease.foods_to_avoid?.map((food, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Habits & Doctor Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/80 pt-6">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Lifestyle & Exercises</h4>
                  <p>{selectedDisease.lifestyle_advice}</p>
                  <p className="mt-2 font-medium">{selectedDisease.exercise}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Doctor Advice & Guidance</h4>
                  <p className="font-medium text-gray-700 dark:text-gray-300">{selectedDisease.doctor_consultation_advice}</p>
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">Recommended Yoga: {selectedDisease.yoga}</p>
                </div>
              </div>

              {/* Disease-Specific Yoga Link Banner */}
              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-6">
                <div className="bg-gradient-to-r from-emerald-900 via-gray-900 to-teal-950 text-white rounded-2xl p-5 shadow-soft border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <TbYoga className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        Practice {selectedDisease.name} Yoga Poses
                      </h4>
                      <p className="text-xs text-gray-300">
                        View HD pose images, voice guides, and animated procedure videos in the Yoga Guide.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/yoga_guide?disease=${encodeURIComponent(selectedDisease.name)}`}
                    className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Open in Yoga Guide ➔
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* Educational medicine disclaimers card */}
          {medicines && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-6">
              
              {/* Safety Disclaimer Banner */}
              <div className="flex items-start gap-3 bg-red-50/50 dark:bg-red-950/10 p-4 rounded-2xl border border-red-100/10 dark:border-red-800/10">
                <HiOutlineExclamation className="w-6 h-6 text-red-500 flex-shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-red-800 dark:text-red-400 text-xs uppercase tracking-wider">Educational Medicine Disclaimer</h4>
                  <p className="text-[11px] text-red-700 dark:text-red-300 mt-0.5 leading-relaxed font-bold">
                    {medicines.disclaimer} This guide lists standard chemical drug classes and general usage information for educational context only. We never prescribe medication dosages, brands, or direct prescriptions.
                  </p>
                </div>
              </div>

              {/* Medicine Navigation Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setMedTab('related')}
                    className={`pb-2 text-xs font-bold transition-all relative ${
                      medTab === 'related'
                        ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    Medicines for {selectedDisease?.name || 'Selected'}
                  </button>
                  <button
                    onClick={() => setMedTab('all')}
                    className={`pb-2 text-xs font-bold transition-all relative ${
                      medTab === 'all'
                        ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    All Medicines Directory ({medicines.categories?.length || 0})
                  </button>
                </div>

                {/* Sub-search for All Medicines */}
                {medTab === 'all' && (
                  <div className="relative w-full sm:w-64">
                    <HiOutlineSearch className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={medSearch}
                      onChange={(e) => setMedSearch(e.target.value)}
                      placeholder="Search active agents or categories..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-850 rounded-xl pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Medicine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medTab === 'related' ? (
                  (() => {
                    const relatedMedicines = medicines.categories?.filter(med =>
                      med.associated_diseases?.some(d => d.toLowerCase() === selectedDisease?.name?.toLowerCase())
                    ) || [];
                    
                    return relatedMedicines.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                        No matching specific medications listed for {selectedDisease?.name}. Browse the full directory to explore all pharmaceutical categories.
                      </div>
                    ) : (
                      relatedMedicines.map((med, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/35 border border-gray-100/50 dark:border-gray-800 rounded-2xl flex flex-col justify-between hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5 animate-fadeIn">
                          <div className="space-y-1.5">
                            <h5 className="font-extrabold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {med.category}
                            </h5>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{med.usage}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {med.examples?.map((ex, i) => (
                                <span key={i} className="text-[9px] font-bold text-green-700 dark:text-green-300 bg-green-500/10 dark:bg-green-500/5 px-2 py-0.5 rounded-md">
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                          {med.education_note && (
                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/50 text-[10px] text-gray-400 font-medium italic">
                              {med.education_note}
                            </div>
                          )}
                        </div>
                      ))
                    );
                  })()
                ) : (
                  (() => {
                    const query = medSearch.toLowerCase();
                    const filteredAllMedicines = medicines.categories?.filter(med => {
                      if (!medSearch) return true;
                      return (
                        med.category.toLowerCase().includes(query) ||
                        med.usage.toLowerCase().includes(query) ||
                        med.education_note?.toLowerCase().includes(query) ||
                        med.examples?.some(ex => ex.toLowerCase().includes(query))
                      );
                    }) || [];

                    return filteredAllMedicines.length === 0 ? (
                      <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                        No medicine categories matched "{medSearch}".
                      </div>
                    ) : (
                      filteredAllMedicines.map((med, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/35 border border-gray-100/50 dark:border-gray-800 rounded-2xl flex flex-col justify-between hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5 animate-fadeIn">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {med.category}
                              </h5>
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-250/50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                                {med.associated_diseases?.[0] || 'General'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{med.usage}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {med.examples?.map((ex, i) => (
                                <span key={i} className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/5 px-2 py-0.5 rounded-md">
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                          {med.education_note && (
                            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/50 text-[10px] text-gray-400 font-medium italic">
                              {med.education_note}
                            </div>
                          )}
                        </div>
                      ))
                    );
                  })()
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Interactive Pose Details Modal with HD Image, Step-by-Step Procedure Video & Voice Audio */}
      {activeModalPose && (
        <PoseDetails
          pose={activeModalPose}
          onClose={() => setActiveModalPose(null)}
          onStartPose={() => {}}
        />
      )}

    </div>
  );
};

export default DiseaseGuide;
