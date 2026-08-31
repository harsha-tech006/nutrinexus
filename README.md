# NutriNexus - AI Nutrition Assistant & Health Emergency Portal

NutriNexus is a production-ready, full-stack, AI-powered Nutrition & Health Emergency application designed for web and mobile devices. It features a responsive React.js frontend, a Python Flask MVC backend, and a MongoDB database.

---

## 🌟 Key Features

1. **Pregnancy Nutrition Module (`/pregnancy-nutrition`):** Trimester-by-trimester prenatal nutrition guidance (1st, 2nd, and 3rd Trimester). Features calorie/protein scaling targets (+340 kcal/day 2nd trimester, +450 kcal/day 3rd trimester), fetal growth milestone size visualizer (Lime, Avocado, Watermelon), essential micronutrient checklist (Folic Acid 600mcg, Calcium 1000mg, Iron 27mg, DHA 300mg), pregnancy food safety matrix (foods to eat vs avoid), and morning sickness remedies.
2. **Period & Menstrual Cycle Tracker (`/cycle-tracker`):** Interactive cycle predictor ring calculating next period date, ovulation/fertile window, and current cycle phase (Menstrual, Follicular, Ovulatory, Luteal). Delivers phase-aligned daily nutrition recommendations (iron loading, anti-inflammatory foods, magnesium craving control).
3. **Period Pain & Symptom Triage Tracker:** Daily period cramp severity logger (0-10 dysmenorrhea pain slider, flow rating, symptoms checklist for cramps, bloating, mood swings). Features an instant non-pharmacological relief protocol with warm herbal teas, magnesium hydration, and period-safe yoga poses.
4. **Nearest Emergency Hospitals Locator (`/hospitals`):** Rapid emergency locator for critical health conditions. Features direct 1-tap SOS dialers for Ambulance (108 / 911), National Emergency (112), and Cardiac hotlines. Filter by Disease Guide specialties (Diabetes, Hypertension, PCOS, Thyroid, Asthma, GERD, Kidney, Trauma), 24/7 emergency open, ICU bed availability, and real-time GPS proximity distance math.
5. **Live Doctor Teleconsultation & Webinars (`/live-doctor-sessions`):** 
   - **Live Doctor Webinars:** Join active live broadcasts with real-time attendee streams and live Q&A.
   - **1-on-1 Doctor Teleconsultation:** Book instant or scheduled virtual appointments with top medical specialists.
   - **Interactive Live Video Room:** Real-time video consultation simulator featuring HD video streams, patient camera preview, microphone and video toggles, live chat with doctors, and instant digital prescription preview.
6. **JWT Authentication & Security:** Secure signup, login, password resets, and email OTP verification.
7. **Dynamic Profiling & Calculations:** Enter age, height, weight, activity levels, and wellness goals. The system automatically computes BMR, TDEE, BMI, water needs, and protein target metrics.
8. **Daily Tracker Logs:** Log breakfast, lunch, dinner, and snacks with calories and macros. Integrates water consumption logs, exercise burn metrics, and fiber tracking.
9. **AI-Powered Nutrition Chat & Meal Planner:** Interact with our Senior Clinical Nutritionist AI. Auto-generates weekly or daily menu plans, with smart mock fallbacks.
10. **Disease & Yoga Guides:** Built-in recommendations for conditions like PCOS, Diabetes, and Hypertension. Includes symptoms, lifestyle advice, exercise routines, yoga poses (with step-by-step guides), and educational medicine categories with safety disclaimers.
11. **Background Reminders:** Scheduled water alerts, pill reminders, email motivational alerts for skipped routines, and push notifications.
12. **Monthly & PDF Health Reports:** Aggregated charts tracking weight, protein, active minutes, and calories, featuring ReportLab PDF download compiles.
13. **Responsive Glassmorphism UI:** A modern theme optimized for desktop monitors, iPads, and mobile viewports.

---

## 🏗️ Codebase Structure

```
nutrition_assistant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── food.py
│   │   │   ├── health.py
│   │   │   ├── hospital.py               # Emergency Hospital schema & locator seed data
│   │   │   ├── doctor.py                 # Live doctor session models
│   │   │   ├── CycleTracker.py           # Menstrual cycle & daily symptom logs schema
│   │   │   ├── PregnancyProfile.py       # Trimester & prenatal nutrition schema
│   │   │   └── notification.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── food.py
│   │   │   ├── health.py
│   │   │   ├── hospital_routes.py        # /api/hospitals endpoints
│   │   │   ├── doctor_routes.py          # /api/doctors endpoints
│   │   │   ├── women_health_routes.py    # /api/women-health endpoints
│   │   │   └── notification.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── nutrition.py
│   │   │   ├── yoga.py
│   │   │   ├── hospital.py
│   │   │   └── medicine.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── helpers.py
│   │   └── config.py
│   ├── controllers/
│   │   ├── auth_controller.py
│   │   ├── tracker_controller.py
│   │   ├── disease_controller.py
│   │   ├── hospital_controller.py        # Hospital search, ICU filter & distance math
│   │   ├── doctor_controller.py          # Live doctor room & appointment booking
│   │   ├── women_health_controller.py    # Menstrual phase predictor & pregnancy guidelines
│   │   └── report_controller.py
│   ├── app.py                            # Flask Entry point & Blueprint registrar
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── DailyTracker.js
│   │   │   ├── MonthlyReport.js
│   │   │   ├── HealthAssistant.js
│   │   │   ├── YogaGuide.js
│   │   │   ├── FoodHistory.js
│   │   │   ├── Goals.js
│   │   │   ├── Navbar.jsx                # Includes Emergency SOS Quick Access Header Button
│   │   │   ├── Sidebar.jsx               # Navigation drawer with Pregnancy & Cycle icons
│   │   │   └── Settings.js
│   │   ├── pages/
│   │   │   ├── PregnancyNutrition.jsx    # Trimester guidelines, fetal milestones & safe food matrix
│   │   │   ├── MenstrualCycleTracker.jsx # Cycle predictor, pain 0-10 slider & cramp relief
│   │   │   ├── HospitalsLocator.jsx      # Emergency SOS Hospital Finder & Map Directions
│   │   │   ├── LiveDoctorSessions.jsx    # Live Webinars & Interactive Video Room
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js                    # womenHealthService endpoints
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx             # /pregnancy-nutrition, /cycle-tracker, /hospitals
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
│       └── index.html
└── README.md
```

---

## 📡 Key API Endpoints

### 🌸 Women's Health & Pregnancy
- **`GET /api/women-health/cycle-status`**: Get cycle phase prediction, ovulation window, and period pain remedies.
- **`POST /api/women-health/cycle-settings`**: Update last period date, cycle length, and duration.
- **`POST /api/women-health/log-symptoms`**: Log daily pain level (0-10), flow, and symptom checklist.
- **`GET /api/women-health/pregnancy-nutrition`**: Get trimester calorie/protein targets, prenatal micronutrients, and food safety matrix.
- **`POST /api/women-health/pregnancy-profile`**: Update trimester, weeks pregnant, and due date.

### 🏥 Emergency Hospital Locator
- **`GET /api/hospitals`**: Search nearest hospitals with filters (`search`, `specialty`, `is_24_7`, `icu_beds`).
- **`GET /api/hospitals/<hospital_id>`**: Retrieve detailed hospital facility profile, ICU bed count, and helpline hotlines.

---

## 🚀 Setup & Launch

### 1. Database Setup
Ensure **MongoDB** is running locally on `mongodb://localhost:27017` or configure your remote MongoDB URI in `backend/.env`.

### 2. Backend Setup (Flask API)
```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
The Flask backend will run on `http://localhost:5000` and automatically seed initial models.

### 3. Frontend Setup (React.js)
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:3000` in your web browser.

---

## 🛡️ Medical Safety Notice

> [!WARNING]
> If you or someone with you is experiencing a medical emergency, acute chest pain, severe breathlessness, or trauma, **immediately dial emergency services (108 / 112 / 911)** or proceed to the nearest emergency hospital. All guides and suggestions within NutriNexus are for educational and tele-triage support.
