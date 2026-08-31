from bson import ObjectId
from database.db import get_db

class Doctor:
    @staticmethod
    def get_video_collection():
        db = get_db()
        return db['doctor_videos'] if db is not None else None

    @staticmethod
    def get_session_collection():
        db = get_db()
        return db['doctor_live_sessions'] if db is not None else None

    @classmethod
    def get_videos(cls, category="", search=""):
        collection = cls.get_video_collection()
        if collection is not None:
            try:
                if collection.count_documents({}) == 0:
                    cls.seed_video_data()
            except Exception:
                pass
            query = {}
            if category and category.lower() != "all":
                query["category"] = {"$regex": category, "$options": "i"}
            if search:
                query["$or"] = [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"doctor_name": {"$regex": search, "$options": "i"}},
                    {"summary": {"$regex": search, "$options": "i"}},
                    {"tags": {"$regex": search, "$options": "i"}}
                ]
            return list(collection.find(query))
        
        return cls.get_mock_videos(category, search)

    @classmethod
    def get_mock_videos(cls, category="", search=""):
        videos = cls.get_seed_videos()
        filtered = []
        for v in videos:
            if category and category.lower() != "all" and category.lower() not in v["category"].lower():
                continue
            if search:
                s_lower = search.lower()
                matches = (s_lower in v["title"].lower() or
                           s_lower in v["doctor_name"].lower() or
                           s_lower in v["summary"].lower() or
                           any(s_lower in tag.lower() for tag in v["tags"]))
                if not matches:
                    continue
            filtered.append(v)
        return filtered

    @classmethod
    def get_live_sessions(cls):
        collection = cls.get_session_collection()
        if collection is not None:
            try:
                if collection.count_documents({}) == 0:
                    cls.seed_session_data()
            except Exception:
                pass
            return list(collection.find({}))
        return cls.get_seed_sessions()

    @classmethod
    def seed_video_data(cls):
        collection = cls.get_video_collection()
        if collection is None:
            return
        try:
            collection.insert_many(cls.get_seed_videos())
        except Exception:
            pass

    @classmethod
    def seed_session_data(cls):
        collection = cls.get_session_collection()
        if collection is None:
            return
        try:
            collection.insert_many(cls.get_seed_sessions())
        except Exception:
            pass

    @classmethod
    def get_seed_videos(cls):
        return [
            {
                "id": "vid-1",
                "title": "Emergency First Response for Sudden Chest Pain & Cardiac Signs",
                "doctor_name": "Dr. Rajesh Mehta, MD (Cardiology)",
                "hospital": "Apollo Heart Institute",
                "category": "Cardiology",
                "duration": "14:20",
                "views": "28.4K",
                "rating": 4.9,
                "video_url": "https://www.youtube.com/embed/5qap5aO4i9A",
                "thumbnail": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
                "summary": "Essential red flag symptoms for acute angina and heart attack. Steps to take before emergency services arrive.",
                "tags": ["Heart Attack", "Angina", "First Aid", "CPR", "Emergency Triage"],
                "key_takeaways": [
                    "Recognize pain radiating to left arm, neck, or jaw.",
                    "Chew 300mg uncoated Aspirin immediately if advised by emergency hotline.",
                    "Sit straight, remain calm, and avoid physical exertion."
                ]
            },
            {
                "id": "vid-2",
                "title": "Managing High Blood Sugar & Hypoglycemia Emergencies",
                "doctor_name": "Dr. Ananya Sharma, DM (Endocrinology)",
                "hospital": "Max Healthcare Clinic",
                "category": "Diabetes",
                "duration": "18:45",
                "views": "42.1K",
                "rating": 4.8,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "thumbnail": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
                "summary": "How to recognize low blood sugar (cold sweat, tremors) vs hyperglycemia spike, and quick dietary fixes.",
                "tags": ["Diabetes", "Hypoglycemia", "Insulin", "Glucose", "Nutrition"],
                "key_takeaways": [
                    "Follow the 15-15 rule for low blood sugar: 15g fast-acting carbs, recheck in 15 mins.",
                    "Keep glucose tabs or fruit juice accessible at all times.",
                    "Hydrate heavily when glucose spikes above 250 mg/dL."
                ]
            },
            {
                "id": "vid-3",
                "title": "Clinical Nutrition Strategy for Reversing Fatty Liver & Hypertension",
                "doctor_name": "Dr. Vikramaditya Rao, DNB (Gastroenterology)",
                "hospital": "Fortis Multi-Specialty",
                "category": "Nutrition",
                "duration": "22:10",
                "views": "19.8K",
                "rating": 4.9,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "thumbnail": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
                "summary": "Evidence-based nutritional protocol combining low glycemic food, omega-3 fatty acids, and fiber to heal liver cells.",
                "tags": ["Fatty Liver", "Hypertension", "Dietetics", "Sodium Reduction", "Detox"],
                "key_takeaways": [
                    "Reduce daily sodium intake to under 2,000mg.",
                    "Include 25g+ soluble fiber daily from oats, flaxseeds, and greens.",
                    "Eliminate ultra-processed high fructose corn syrup."
                ]
            },
            {
                "id": "vid-4",
                "title": "Panic Attack vs Medical Emergency: Instant Calming & Breathing Techniques",
                "doctor_name": "Dr. Priya Nair, MD (Psychiatry)",
                "hospital": "Mind Care Wellness Institute",
                "category": "Mental Health",
                "duration": "11:05",
                "views": "35.6K",
                "rating": 4.9,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
                "summary": "How to differentiate hyperventilation anxiety from physiological respiratory failure and regain grounded calm.",
                "tags": ["Anxiety", "Panic Attack", "Mindfulness", "Vagus Nerve", "Breathing"],
                "key_takeaways": [
                    "Practice 4-7-8 diaphragmatic breathing.",
                    "Use 5-4-3-2-1 sensory grounding to break anxiety loops.",
                    "Seek medical evaluation if chest pressure is accompanied by cold sweating."
                ]
            },
            {
                "id": "vid-5",
                "title": "Choking Emergency & Heimlich Maneuver Demonstration",
                "doctor_name": "Dr. Robert Sterling, ER Lead Specialist",
                "hospital": "St. Jude Emergency Center",
                "category": "Emergency First Aid",
                "duration": "08:30",
                "views": "56.3K",
                "rating": 5.0,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "thumbnail": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
                "summary": "Step-by-step life-saving guide for abdominal thrusts, infant choking response, and self-Heimlich procedures.",
                "tags": ["First Aid", "Heimlich", "Choking", "ER Response", "Life Support"],
                "key_takeaways": [
                    "Perform 5 back blows followed by 5 abdominal thrusts.",
                    "Position fist just above the navel for adults.",
                    "For infants, use 5 gentle back slaps and chest thrusts."
                ]
            }
        ]

    @classmethod
    def get_seed_sessions(cls):
        return [
            {
                "id": "live-1",
                "doctor_name": "Dr. Sarah Jenkins, MD",
                "specialty": "Senior Clinical Nutritionist & Cardiologist",
                "title": "Live Q&A: Emergency Dietary Adjustments for High Blood Pressure & Cholesterol",
                "status": "LIVE_NOW",
                "viewers_count": 142,
                "scheduled_time": "Today, 11:00 AM - 12:00 PM",
                "doctor_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
                "topics": ["Hypertension management", "Emergency sodium flush", "Heart healthy lipid diet"],
                "is_instant_available": True
            },
            {
                "id": "live-2",
                "doctor_name": "Dr. Alok Verma, MD, DM",
                "specialty": "Consultant Physician & Diabetologist",
                "title": "Live Masterclass: Managing HbA1c & Sudden Sugar Fluctuations",
                "status": "UPCOMING",
                "scheduled_time": "Today, 4:00 PM - 5:00 PM",
                "viewers_count": 89,
                "doctor_avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                "topics": ["HbA1c optimization", "Pre-meal glucose spikes", "Emergency insulin safety"],
                "is_instant_available": True
            },
            {
                "id": "live-3",
                "doctor_name": "Dr. Elena Rostova, DNB",
                "specialty": "Emergency Medicine & Acute Care Specialist",
                "title": "Live Teleconsultation & Rapid Symptom Assessment",
                "status": "UPCOMING",
                "scheduled_time": "Tomorrow, 10:00 AM - 11:30 AM",
                "viewers_count": 54,
                "doctor_avatar": "https://images.unsplash.com/photo-1594824813571-2b533411efa0?auto=format&fit=crop&w=300&q=80",
                "topics": ["Triage self-check", "Abdominal pain evaluation", "Fever & Infection safety"],
                "is_instant_available": False
            }
        ]
