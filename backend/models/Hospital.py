from bson import ObjectId
from database.db import get_db

class Hospital:
    @staticmethod
    def get_collection():
        db = get_db()
        return db['hospitals']

    @classmethod
    def get_all(cls, search="", specialty="", availability_247=False, icu_only=False):
        collection = cls.get_collection()
        try:
            if collection is not None and collection.count_documents({}) == 0:
                cls.seed_data()
        except Exception:
            pass

        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"city": {"$regex": search, "$options": "i"}},
                {"address": {"$regex": search, "$options": "i"}},
                {"specialties": {"$regex": search, "$options": "i"}},
                {"disease_guide_matches": {"$regex": search, "$options": "i"}}
            ]
        if specialty:
            query["$or"] = [
                {"specialties": {"$regex": specialty, "$options": "i"}},
                {"disease_guide_matches": {"$regex": specialty, "$options": "i"}}
            ]
        if availability_247:
            query["is_24_7"] = True
        if icu_only:
            query["icu_beds_available"] = {"$gt": 0}

        if collection is None:
            return cls.get_mock_hospitals(search, specialty, availability_247, icu_only)

        return list(collection.find(query))

    @classmethod
    def get_mock_hospitals(cls, search="", specialty="", availability_247=False, icu_only=False):
        hospitals = cls.get_seed_list()
        filtered = []
        for h in hospitals:
            if search:
                s_lower = search.lower()
                matches = (s_lower in h["name"].lower() or 
                           s_lower in h["city"].lower() or 
                           s_lower in h["address"].lower() or
                           any(s_lower in spec.lower() for spec in h["specialties"]) or
                           any(s_lower in dis.lower() for dis in h.get("disease_guide_matches", [])))
                if not matches:
                    continue
            if specialty:
                sp_lower = specialty.lower()
                spec_match = any(sp_lower in spec.lower() for spec in h["specialties"]) or \
                             any(sp_lower in dis.lower() for dis in h.get("disease_guide_matches", []))
                if not spec_match:
                    continue
            if availability_247 and not h.get("is_24_7"):
                continue
            if icu_only and h.get("icu_beds_available", 0) <= 0:
                continue
            filtered.append(h)
        return filtered

    @classmethod
    def find_by_id(cls, hospital_id):
        collection = cls.get_collection()
        if collection is None:
            for h in cls.get_seed_list():
                if str(h.get("_id")) == str(hospital_id) or str(h.get("id")) == str(hospital_id):
                    return h
            return None
        if isinstance(hospital_id, str) and len(hospital_id) == 24:
            hospital_id = ObjectId(hospital_id)
        return collection.find_one({"_id": hospital_id})

    @classmethod
    def seed_data(cls):
        collection = cls.get_collection()
        if collection is None:
            return
        hospitals = cls.get_seed_list()
        try:
            collection.drop()
            collection.insert_many(hospitals)
        except Exception:
            pass

    @classmethod
    def get_seed_list(cls):
        return [
            {
                "id": "hosp-1",
                "name": "Apollo Multi-Specialty & Diabetes Emergency Center",
                "city": "Bengaluru",
                "address": "Plot 13, Indiranagar 100ft Road, Bengaluru, KA 560038",
                "distance_km": 1.2,
                "response_time_mins": 4,
                "rating": 4.9,
                "is_24_7": True,
                "emergency_hotline": "+91 80 3350 3350",
                "ambulance_number": "108",
                "icu_beds_available": 14,
                "total_beds": 350,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes", "Cardiology & Heart Care", "Neurology & Stroke", "Pulmonology & Asthma ER", "Level-1 Trauma"],
                "disease_guide_matches": ["Diabetes", "Hypertension", "Asthma & COPD", "Obesity", "Thyroid (Hypothyroidism)"],
                "latitude": 13.0827,
                "longitude": 77.5877,
                "google_maps_url": "https://maps.google.com/?q=Apollo+Hospital+Indiranagar+Bengaluru",
                "image": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": "hosp-2",
                "name": "Fortis Cardiac & Endocrine Critical Care",
                "city": "Bengaluru",
                "address": "154/9 Bannerghatta Main Road, Opp IIMB, Bengaluru, KA 560076",
                "distance_km": 2.4,
                "response_time_mins": 7,
                "rating": 4.8,
                "is_24_7": True,
                "emergency_hotline": "+91 80 6799 4444",
                "ambulance_number": "108",
                "icu_beds_available": 8,
                "total_beds": 280,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes Care", "Interventional Cardiology", "Rheumatology & Joint ER", "Critical Intensive Care"],
                "disease_guide_matches": ["Diabetes", "Hypertension", "Gout (High Uric Acid)", "Obesity", "Thyroid (Hyperthyroidism)"],
                "latitude": 12.898,
                "longitude": 77.599,
                "google_maps_url": "https://maps.google.com/?q=Fortis+Hospital+Bannerghatta+Bengaluru",
                "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": "hosp-3",
                "name": "Max Super Specialty Women & Diabetes Center",
                "city": "Bengaluru",
                "address": "45 MG Road, Near Trinity Circle, Bengaluru, KA 560001",
                "distance_km": 3.6,
                "response_time_mins": 9,
                "rating": 4.9,
                "is_24_7": True,
                "emergency_hotline": "+91 80 2651 5050",
                "ambulance_number": "102",
                "icu_beds_available": 22,
                "total_beds": 500,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes", "Gynecology & PCOS Care", "Nephrology & Renal Dialysis", "Pulmonology & Asthma ER"],
                "disease_guide_matches": ["Diabetes", "PCOS", "PCOD", "Chronic Kidney Disease (CKD)", "Asthma & COPD"],
                "latitude": 12.973,
                "longitude": 77.617,
                "google_maps_url": "https://maps.google.com/?q=Max+Hospital+MG+Road+Bengaluru",
                "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": "hosp-4",
                "name": "Manipal Heart, Diabetes & Digestive Institute",
                "city": "Bengaluru",
                "address": "98 HAL Old Airport Road, Kodihalli, Bengaluru, KA 560017",
                "distance_km": 4.9,
                "response_time_mins": 10,
                "rating": 4.7,
                "is_24_7": True,
                "emergency_hotline": "+91 80 2502 4444",
                "ambulance_number": "108",
                "icu_beds_available": 11,
                "total_beds": 300,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes", "Gastroenterology & GERD Care", "Endocrinology & Thyroid Care", "Renal Dialysis ER"],
                "disease_guide_matches": ["Diabetes", "GERD (Acid Reflux)", "Irritable Bowel Syndrome (IBS)", "Thyroid (Hypothyroidism)", "Thyroid (Hyperthyroidism)"],
                "latitude": 12.958,
                "longitude": 77.648,
                "google_maps_url": "https://maps.google.com/?q=Manipal+Hospital+HAL+Airport+Road+Bengaluru",
                "image": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": "hosp-5",
                "name": "Gleneagles Global City Renal & Diabetes Hospital",
                "city": "Bengaluru",
                "address": "Kengeri Satellite Town, Bengaluru, KA 560060",
                "distance_km": 6.5,
                "response_time_mins": 12,
                "rating": 4.6,
                "is_24_7": True,
                "emergency_hotline": "+91 80 4477 7000",
                "ambulance_number": "108",
                "icu_beds_available": 6,
                "total_beds": 220,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes", "Nephrology & Kidney Care", "Rheumatology & Joint ER", "Gastroenterology"],
                "disease_guide_matches": ["Diabetes", "Chronic Kidney Disease (CKD)", "Gout (High Uric Acid)", "GERD (Acid Reflux)"],
                "latitude": 12.911,
                "longitude": 77.482,
                "google_maps_url": "https://maps.google.com/?q=Gleneagles+Global+Hospital+Bengaluru",
                "image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80"
            },
            {
                "id": "hosp-6",
                "name": "St. Jude Women, Diabetes & Family Emergency Hospital",
                "city": "Bengaluru",
                "address": "Outer Ring Road, Marathahalli, Bengaluru, KA 560037",
                "distance_km": 8.2,
                "response_time_mins": 14,
                "rating": 4.9,
                "is_24_7": True,
                "emergency_hotline": "+91 80 555 0199",
                "ambulance_number": "108",
                "icu_beds_available": 18,
                "total_beds": 420,
                "trauma_center": True,
                "cardiac_emergency": True,
                "stroke_unit": True,
                "specialties": ["Endocrinology & Diabetes", "Gynecology & PCOS Care", "Pediatric ER", "Asthma & Respiration Crisis"],
                "disease_guide_matches": ["Diabetes", "PCOS", "PCOD", "Asthma & COPD", "Obesity"],
                "latitude": 12.956,
                "longitude": 77.701,
                "google_maps_url": "https://maps.google.com/?q=St+Jude+Hospital+Bengaluru",
                "image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80"
            }
        ]
