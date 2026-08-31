import React, { useContext, useState } from 'react';
import { 
  HiX, 
  HiShieldCheck, 
  HiExclamation, 
  HiFingerPrint, 
  HiLightningBolt, 
  HiVolumeUp,
  HiOutlineSparkles,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { LanguageContext } from '../../context/LanguageContext';
import YogaAudioPlayer from './YogaAudioPlayer';
import YogaStepVideoPlayer from './YogaStepVideoPlayer';

export const PoseDetails = ({
  pose,
  onClose,
  onStartPose,
  onImageClick,
  userProfile = null,
  isLargeTextMode = false
}) => {
  const { language, t } = useContext(LanguageContext);
  const [imageError, setImageError] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isStepperMode, setIsStepperMode] = useState(true); // Default to One-by-One mode
  let synth = window.speechSynthesis;

  // Localized values
  const hasTranslation = pose.translations && pose.translations[language];
  
  const poseName = hasTranslation && pose.translations[language].name
    ? pose.translations[language].name
    : pose.name;

  const shortDesc = hasTranslation && pose.translations[language].short_description
    ? pose.translations[language].short_description
    : pose.short_description || "";
  
  const benefits = hasTranslation && pose.translations[language].benefits
    ? pose.translations[language].benefits
    : pose.benefits || [];
    
  const instructions = (hasTranslation && pose.translations[language].instructions
    ? pose.translations[language].instructions
    : pose.step_by_step_instructions || []).map(st => typeof st === 'string' ? st.replace(/^Step \d+:\s*/i, '') : st);

  const breathing = hasTranslation && pose.translations[language].breathing_instructions
    ? pose.translations[language].breathing_instructions
    : pose.breathing_instructions || [];

  const commonMistakes = hasTranslation && pose.translations[language].common_mistakes
    ? pose.translations[language].common_mistakes
    : pose.common_mistakes || [];

  const safetyPrecautions = hasTranslation && pose.translations[language].safety_precautions
    ? pose.translations[language].safety_precautions
    : pose.safety_precautions || [];

  const avoidIfList = hasTranslation && pose.translations[language].avoid_if
    ? pose.translations[language].avoid_if
    : pose.avoid_if || [];

  const musclesTargeted = hasTranslation && pose.translations[language].muscles_targeted
    ? pose.translations[language].muscles_targeted
    : pose.muscles_targeted || [];

  const suitableDiseases = hasTranslation && pose.translations[language].suitable_diseases
    ? pose.translations[language].suitable_diseases
    : pose.suitable_diseases || [];

  // Determine fallback high quality Unsplash image URL
  const getDisplayImageUrl = () => {
    if (!imageError && pose.imageUrl && pose.imageUrl.startsWith('http')) {
      return pose.imageUrl;
    }
    const name = (pose.sanskrit_name || pose.name || '').toLowerCase();
    if (name.includes('cobra') || name.includes('bhujangasana')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80';
    if (name.includes('tree') || name.includes('vrikshasana')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    if (name.includes('dog') || name.includes('adho mukha')) return 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80';
    if (name.includes('warrior') || name.includes('virabhadrasana')) return 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80';
    if (name.includes('butterfly') || name.includes('baddha konasana')) return 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80';
    if (name.includes('child') || name.includes('balasana')) return 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80';
    if (name.includes('corpse') || name.includes('shavasana')) return 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format&fit=crop&q=80';
    if (name.includes('bridge') || name.includes('setu bandha')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    if (name.includes('frog') || name.includes('mandukasana')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80';
    if (name.includes('triangle') || name.includes('trikonasana')) return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80';
    if (name.includes('bow') || name.includes('dhanurasana')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    if (name.includes('forward') || name.includes('paschimottanasana')) return 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80';
    if (name.includes('twist') || name.includes('ardha matsyendrasana')) return 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80';
    if (name.includes('plow') || name.includes('halasana')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    if (name.includes('shoulder') || name.includes('sarvangasana')) return 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80';
    if (name.includes('mountain') || name.includes('tadasana')) return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    if (name.includes('legs') || name.includes('viparita')) return 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format&fit=crop&q=80';
    if (name.includes('plank') || name.includes('phalakasana')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80';
    if (name.includes('camel') || name.includes('ustrasana')) return 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80';
  };

  const displayImgUrl = getDisplayImageUrl();

  // Speak step aloud helper
  const speakStepText = (text, stepNum) => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`Step ${stepNum}: ${text}`);
    utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Determine if warning is active
  const isAvoidRecommended = () => {
    if (!userProfile || !pose.avoid_if) return false;
    const userDiseases = (userProfile.diseases || []).map(d => d.toLowerCase().trim());
    return pose.avoid_if.some(cond => userDiseases.includes(cond.toLowerCase().trim()));
  };

  const hasWarning = isAvoidRecommended();

  // Cleanup synthesis on close
  const handleClose = () => {
    if (synth) synth.cancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800/80 animate-scaleUp">
        
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">{poseName}</h2>
            {pose.sanskrit_name && (
              <p className="text-xs text-emerald-100/90 font-medium italic mt-0.5">{t('sanskritName')}: {pose.sanskrit_name}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-all duration-200"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* Pose Large Image */}
          <div className="relative rounded-2xl overflow-hidden h-64 border border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-gray-850 flex items-center justify-center group shadow-sm">
            <img 
              src={displayImgUrl} 
              alt={poseName}
              className="w-full h-full object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
              onClick={() => onImageClick && onImageClick(displayImgUrl)}
              onError={() => setImageError(true)}
            />
            <span className="absolute bottom-3 right-3 bg-black/60 text-[9px] font-bold text-white px-2.5 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Click for Full-screen Zoom
            </span>
          </div>

          {/* Step-by-Step Procedure Animated Video Player */}
          <YogaStepVideoPlayer pose={pose} language={language} />

          {/* AI Warning Banner */}
          {hasWarning && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex gap-3 text-red-700 dark:text-red-400">
              <HiExclamation className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wide">{t('avoidIf')} Warning</h4>
                <p className="text-xs font-semibold mt-1">
                  Based on your medical profile, you are advised to **avoid** this pose. Please consult a physician before attempting.
                </p>
              </div>
            </div>
          )}

          {/* Short Description */}
          {shortDesc && (
            <div className="bg-gray-50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/40 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed italic">
                "{shortDesc}"
              </p>
            </div>
          )}

          {/* Premium Audio Player integration */}
          {!hasWarning && (
            <YogaAudioPlayer pose={pose} />
          )}

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-3 border border-gray-100 dark:border-gray-800/50 text-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{t('duration')}</span>
              <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 mt-0.5">{pose.duration_sec ? `${pose.duration_sec}s` : pose.duration || '30s'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-3 border border-gray-100 dark:border-gray-800/50 text-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{t('repetitions')}</span>
              <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 mt-0.5">{pose.repetitions || '1'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-3 border border-gray-100 dark:border-gray-800/50 text-center">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">{t('caloriesBurned')}</span>
              <p className="text-sm font-extrabold text-gray-700 dark:text-gray-200 mt-0.5">~{pose.calories_burned || 12} cal</p>
            </div>
          </div>

          {/* Muscles Targeted & Suitable Diseases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1">
                <HiFingerPrint className="w-4 h-4 text-emerald-500" />
                {t('targetMuscles')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {musclesTargeted.map((muscle, i) => (
                  <span key={i} className="text-[10px] font-bold text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-1">
                <HiLightningBolt className="w-4 h-4 text-amber-500" />
                {t('suitableDiseases')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {suitableDiseases.map((disease, i) => (
                  <span key={i} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions with Interactive One-by-One Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">
                {t('instructions')} (Step-by-Step Procedure)
              </h4>
              <button
                onClick={() => setIsStepperMode(!isStepperMode)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                {isStepperMode ? '📜 View All Steps' : '🔢 View Procedures One-by-One'}
              </button>
            </div>

            {instructions.length > 0 && isStepperMode ? (
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-4">
                {/* Step indicator pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/30 pb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {instructions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStepIdx(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          idx === activeStepIdx
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-100'
                        }`}
                      >
                        Step {idx + 1}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    Step {activeStepIdx + 1} of {instructions.length}
                  </span>
                </div>

                {/* Active Step Content */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeStepIdx + 1}
                    </span>
                    <button
                      onClick={() => speakStepText(instructions[activeStepIdx], activeStepIdx + 1)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                    >
                      <HiVolumeUp className="w-4 h-4" /> Listen to Step
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                    {instructions[activeStepIdx]}
                  </p>
                </div>

                {/* Prev / Next Controls */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
                    disabled={activeStepIdx === 0}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeStepIdx === 0
                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                        : 'text-emerald-700 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <HiChevronLeft className="w-4 h-4" /> Previous Step
                  </button>

                  <button
                    onClick={() => setActiveStepIdx(prev => Math.min(instructions.length - 1, prev + 1))}
                    disabled={activeStepIdx === instructions.length - 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeStepIdx === instructions.length - 1
                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                        : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    Next Step <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <ol className="list-decimal pl-5 space-y-2">
                {instructions.map((step, i) => (
                  <li
                    key={i}
                    className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
                      isLargeTextMode ? 'text-sm font-semibold' : 'text-xs font-medium'
                    }`}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>


          {/* Breathing Instructions */}
          {breathing.length > 0 && (
            <div className="space-y-2 bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/30 rounded-2xl p-4">
              <h4 className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1">
                <HiOutlineSparkles className="w-4 h-4 text-blue-500" />
                Breathing Instructions
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs font-semibold text-blue-800/90 dark:text-blue-300/80">
                {breathing.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="space-y-2 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/30 rounded-2xl p-4">
              <h4 className="text-xs uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider">
                {t('commonMistakes')}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs font-semibold text-rose-800/90 dark:text-rose-300/80">
                {commonMistakes.map((mistake, i) => (
                  <li key={i}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Precautions */}
          {safetyPrecautions.length > 0 && (
            <div className="space-y-2 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/30 rounded-2xl p-4">
              <h4 className="text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                <HiShieldCheck className="w-4 h-4" />
                {t('safetyPrecautions')}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs font-semibold text-emerald-800/90 dark:text-emerald-300/80">
                {safetyPrecautions.map((precaution, i) => (
                  <li key={i}>{precaution}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications (Avoid List) */}
          {avoidIfList.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-gray-400 dark:text-gray-500 tracking-wider">
                Contraindications ({t('avoidIf')})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {avoidIfList.map((cond, i) => (
                  <span key={i} className="text-[10px] font-bold text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/25 px-2.5 py-1 rounded-full">
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 px-6 py-4 flex justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {t('cancel')}
          </button>
          
          {!hasWarning ? (
            <button
              onClick={() => {
                if (synth) synth.cancel();
                onStartPose(pose);
              }}
              className="px-6 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-soft shadow-emerald-500/10 hover:shadow-md transition-all duration-200"
            >
              {t('startPractice')}
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-2 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            >
              Blocked
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PoseDetails;
