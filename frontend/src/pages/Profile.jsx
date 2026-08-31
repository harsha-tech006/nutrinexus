import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { HiOutlineUser, HiOutlineInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [activityLevel, setActivityLevel] = useState(user?.activity_level || 'Sedentary');
  const [goal, setGoal] = useState(user?.goal || 'Healthy Lifestyle');
  const [languagePref, setLanguagePref] = useState(user?.language_preference || 'English');
  const [selectedDiseases, setSelectedDiseases] = useState(user?.diseases || []);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updating, setUpdating] = useState(false);

  const avatarPresets = [
    { label: '🏋️ Athlete', emoji: '🏋️', bg: 'bg-emerald-500' },
    { label: '🧘 Yogi', emoji: '🧘', bg: 'bg-teal-500' },
    { label: '🥗 Healthy Chef', emoji: '🥗', bg: 'bg-green-600' },
    { label: '🏃 Runner', emoji: '🏃', bg: 'bg-indigo-500' },
    { label: '🚴 Cyclist', emoji: '🚴', bg: 'bg-blue-500' },
    { label: '🩺 Health Expert', emoji: '🩺', bg: 'bg-purple-600' },
    { label: '💧 Hydration Pro', emoji: '💧', bg: 'bg-cyan-500' },
    { label: '🥑 Nutritionist', emoji: '🥑', bg: 'bg-lime-600' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        toast.success('Profile photo loaded! Click Save to update profile.');
      };
      reader.readAsDataURL(file);
    }
  };

  const diseasesList = [
    'Diabetes', 'PCOS', 'PCOD', 'Hypertension', 'Obesity', 
    'High Cholesterol', 'Heart Disease', 'Kidney Disease', 
    'Thyroid', 'Fatty Liver', 'Vitamin Deficiency'
  ];

  const handleDiseaseToggle = (disease) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease) 
        : [...prev, disease]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateProfile({
        name,
        gender,
        avatar,
        age: parseInt(age) || null,
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        activity_level: activityLevel,
        goal,
        diseases: selectedDiseases,
        language_preference: languagePref
      });

      if (res.success) {
        toast.success('Health profile & photo updated successfully! 🎉');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile details.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">My Health Profile</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Customize your personal photo, physical metrics, and disease guidelines.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 md:p-8 shadow-soft space-y-6">
        
        {/* Profile Photo Uploader Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col md:flex-row items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-md bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{name.charAt(0).toUpperCase() || 'H'}</span>
              )}
            </div>

            <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-md transition-all active:scale-95">
              <span className="text-xs">📷</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">Profile Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Upload a custom photo from your device.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <label className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm">
                <span>Upload Custom Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/80 pb-3 flex items-center gap-2">
            <HiOutlineUser className="w-5 h-5 text-green-500" />
            <span>Demographic Variables</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email (Read Only)</label>
              <input
                type="text"
                value={user?.email || ''}
                className="w-full bg-gray-100 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:outline-none"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="yrs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Height (m)</label>
              <input
                type="number"
                step="0.01"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="e.g. 1.75"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="kg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="Sedentary">Sedentary (No exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/wk)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                <option value="Very Active">Very Active (6-7 days/wk)</option>
                <option value="Extra Active">Extra Active (Heavy workload)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fitness Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Healthy Lifestyle">Healthy Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Language Preference</label>
              <select
                value={languagePref}
                onChange={(e) => setLanguagePref(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Marathi">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* Diagnosed Diseases Checklist */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Diagnosed Medical Conditions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {diseasesList.map((disease) => (
                <button
                  key={disease}
                  type="button"
                  onClick={() => handleDiseaseToggle(disease)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedDiseases.includes(disease)
                      ? 'bg-green-500 text-white border-green-500 shadow-soft shadow-green-500/10'
                      : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {disease}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all shadow-medium shadow-green-500/10 disabled:opacity-50"
          >
            {updating ? 'Saving Profile...' : 'Save Health Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
