import React, { useContext, useState } from 'react';
import { 
  HiHeart, 
  HiOutlineHeart, 
  HiOutlineClock, 
  HiOutlineSparkles, 
  HiPlay, 
  HiCheckCircle,
  HiOutlineShare,
  HiVolumeUp
} from 'react-icons/hi';
import { LanguageContext } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

// High-quality SVG illustrations for yoga poses as fallback
const PoseIllustration = ({ name, className = "w-full h-44" }) => {
  const getSvgContent = () => {
    switch (name.toLowerCase()) {
      case 'cobra pose':
      case 'bhujangasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M10 85 C40 85, 50 80, 55 60 C60 40, 50 20, 75 15 C85 15, 90 25, 90 35" strokeLinecap="round"/>
            <circle cx="75" cy="15" r="4" fill="currentColor"/>
            <path d="M5 85 L95 85" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
          </svg>
        );
      case 'butterfly pose':
      case 'baddha konasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M50 30 C30 10, 10 30, 48 65 C49 67, 51 67, 52 65 C90 30, 70 10, 50 30 Z" fill="none"/>
            <path d="M50 30 C40 20, 25 40, 48 55 C49 56, 51 56, 52 55 C75 40, 60 20, 50 30 Z" fill="none"/>
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 85 L80 85" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'thunderbolt pose':
      case 'vajrasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M30 80 L70 80 M35 80 C35 60, 45 50, 45 35 C45 25, 55 25, 55 35 C55 45, 50 55, 50 70 L65 80" strokeLinecap="round"/>
            <circle cx="50" cy="20" r="5" fill="currentColor"/>
            <path d="M10 85 L90 85" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      case 'corpse pose':
      case 'shavasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-teal-500" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="15" y1="50" x2="75" y2="50" strokeLinecap="round"/>
            <circle cx="82" cy="50" r="5" fill="currentColor"/>
            <line x1="25" y1="40" x2="35" y2="50"/>
            <line x1="25" y1="60" x2="35" y2="50"/>
            <line x1="50" y1="35" x2="55" y2="50"/>
            <line x1="50" y1="65" x2="55" y2="50"/>
            <path d="M5 55 L95 55" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
          </svg>
        );
      case 'child pose':
      case 'child\'s pose':
      case 'balasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-sky-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 80 C15 50, 40 45, 50 55 C60 65, 75 75, 80 80" strokeLinecap="round"/>
            <circle cx="45" cy="50" r="4" fill="currentColor"/>
            <path d="M5 80 L95 80" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'sun salutation':
      case 'surya namaskar':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3"/>
            <path d="M50 15 L50 25 M50 75 L50 85 M15 50 L25 50 M75 50 L85 50 M25 25 L32 32 M68 68 L75 75 M75 25 L68 32 M32 68 L25 75" strokeLinecap="round"/>
          </svg>
        );
      case 'frog pose':
      case 'mandukasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M30 75 C30 60, 40 50, 50 50 C60 50, 70 60, 70 75 M20 75 L80 75" strokeLinecap="round"/>
            <circle cx="50" cy="40" r="6" fill="currentColor"/>
            <path d="M35 55 Q20 60, 30 75 M65 55 Q80 60, 70 75" strokeWidth="2"/>
          </svg>
        );
      case 'plank pose':
      case 'phalakasana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="20" y1="40" x2="80" y2="55" strokeWidth="5" strokeLinecap="round"/>
            <line x1="25" y1="41" x2="25" y2="70" strokeWidth="3"/>
            <line x1="75" y1="54" x2="80" y2="75" strokeWidth="3"/>
            <path d="M5 80 L95 80" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'warrior pose':
      case 'virabhadrasana':
      case 'virabhadrasana i':
      case 'virabhadrasana ii':
      case 'virabhadrasana iii':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M25 80 L40 55 L65 55 L85 80 M50 55 L50 35 M30 35 L70 35" strokeLinecap="round"/>
            <circle cx="50" cy="27" r="5" fill="currentColor"/>
            <path d="M10 82 L90 82" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      case 'easy pose':
      case 'sukhasana':
      case 'meditation':
      case 'dhyana':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M30 75 C30 65, 40 55, 50 55 C60 55, 70 65, 70 75" strokeLinecap="round"/>
            <circle cx="50" cy="42" r="6" fill="currentColor"/>
            <path d="M25 75 C25 82, 75 82, 75 75 Z" fill="none"/>
            <circle cx="50" cy="62" r="3" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="50" cy="50" r="18" strokeDasharray="3 3"/>
            <path d="M30 50 C40 35, 60 35, 70 50 C60 65, 40 65, 30 50 Z" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center bg-gray-150/40 dark:bg-gray-800/40 rounded-2xl p-4 ${className}`}>
      {getSvgContent()}
    </div>
  );
};

export const YogaCard = ({
  pose,
  isFavorite = false,
  isCompletedToday = false,
  listeningProgress = null, // { listened_sec, total_sec, completed_listening }
  onToggleFavorite,
  onViewDetails,
  onStartPose,
  onImageClick,
  userProfile = null
}) => {
  const { language, t } = useContext(LanguageContext);
  const [imageError, setImageError] = useState(false);

  // Localized values
  const hasTranslation = pose.translations && pose.translations[language];
  const poseName = hasTranslation && pose.translations[language].name
    ? pose.translations[language].name
    : pose.name;
  
  const sanskritName = pose.sanskrit_name || "";
  const benefitsPreview = hasTranslation && pose.translations[language].benefits
    ? pose.translations[language].benefits[0]
    : (pose.benefits && pose.benefits[0]) || "";
  const shortDesc = hasTranslation && pose.translations[language].short_description
    ? pose.translations[language].short_description
    : pose.short_description || "";

  // Difficulty colors
  const getDifficultyStyles = (difficulty = "Beginner") => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-50 text-green-600 border border-green-200/60 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30';
      case 'intermediate':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30';
      case 'advanced':
        return 'bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // AI avoidance trigger
  const shouldAvoid = () => {
    if (!userProfile || !pose.avoid_if) return false;
    const userDiseases = (userProfile.diseases || []).map(d => d.toLowerCase().trim());
    return pose.avoid_if.some(cond => userDiseases.includes(cond.toLowerCase().trim()));
  };

  const isAvoidRecommended = shouldAvoid();

  // Share action trigger
  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `Check out ${poseName} (${sanskritName}) on the Nutrition Assistant! Difficulty: ${pose.difficulty}. Benefits: ${benefitsPreview}`;
    
    if (navigator.share) {
      navigator.share({
        title: poseName,
        text: shareText,
        url: window.location.href
      }).catch(err => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Pose details copied to clipboard!");
    }
  };

  // Compute listening progress values
  const listenedSec = listeningProgress?.listened_sec || 0;
  const totalSec = listeningProgress?.total_sec || pose.duration_sec || 60;
  const listenPercent = Math.min(100, Math.round((listenedSec / totalSec) * 100));
  const isListeningDone = listeningProgress?.completed_listening || listenPercent >= 99;

  return (
    <div className={`relative bg-white dark:bg-gray-900 border ${
      isAvoidRecommended 
        ? 'border-red-200 dark:border-red-950/40 bg-red-50/10 dark:bg-red-950/5' 
        : 'border-gray-200/70 dark:border-gray-800/60'
    } rounded-3xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-all duration-300 group`}>
      
      {/* Absolute Badges */}
      <div className="absolute top-8 right-8 flex items-center gap-2 z-10">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100 text-gray-500 dark:text-gray-300 transition-colors shadow-sm"
          title="Share Pose"
        >
          <HiOutlineShare className="w-4 h-4" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(pose._id)}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-colors duration-200 shadow-sm"
        >
          {isFavorite ? (
            <HiHeart className="w-4 h-4 text-red-500 animate-pulse" />
          ) : (
            <HiOutlineHeart className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Pose Image with Fallback Illustration */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/20 h-44 flex items-center justify-center border border-gray-100 dark:border-gray-800">
          {(() => {
            const getDisplayImageUrl = () => {
              if (!imageError && pose.imageUrl && pose.imageUrl.startsWith('http')) {
                return pose.imageUrl;
              }
              const name = (sanskritName || poseName || '').toLowerCase();
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
            const cardImgUrl = getDisplayImageUrl();
            return (
              <>
                <img 
                  src={cardImgUrl} 
                  alt={poseName}
                  loading="lazy"
                  onClick={() => onImageClick && onImageClick(cardImgUrl)}
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
                  onError={() => setImageError(true)}
                />
                <span className="absolute bottom-2 right-2 bg-black/60 text-[8px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to Zoom
                </span>
              </>
            );
          })()}
        </div>

        {/* Header information */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getDifficultyStyles(pose.difficulty)}`}>
              {t(pose.difficulty?.toLowerCase()) || pose.difficulty}
            </span>
            {isAvoidRecommended && (
              <span className="text-[10px] font-extrabold text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wide border border-red-200 dark:border-red-900/30">
                ⚠️ {t('avoidIf')}
              </span>
            )}
            {isCompletedToday && (
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                <HiCheckCircle className="w-3.5 h-3.5" />
                Done
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            {poseName}
          </h3>
          {sanskritName && (
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium italic mt-0.5">
              {sanskritName}
            </p>
          )}
        </div>

        {/* Short description */}
        {shortDesc && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {shortDesc}
          </p>
        )}

        {/* Benefits Preview */}
        {benefitsPreview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-1">✦</span>
            {benefitsPreview}
          </p>
        )}

        {/* Listening Progress Bar */}
        {listenedSec > 0 && (
          <div className="bg-gray-50 dark:bg-gray-850 p-2 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
            <div className="flex items-center justify-between text-[8px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <HiVolumeUp className={`w-3 h-3 ${isListeningDone ? 'text-emerald-500' : 'text-blue-500'}`} />
                Listening progress
              </span>
              <span>{listenPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isListeningDone ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-300`} 
                style={{ width: `${listenPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 dark:text-gray-500 pt-1">
          <span className="flex items-center gap-1">
            <HiOutlineClock className="w-4 h-4 text-emerald-500" />
            {pose.duration_sec ? `${pose.duration_sec}s` : pose.duration || '30s'}
          </span>
          <span className="flex items-center gap-1">
            <HiOutlineSparkles className="w-4 h-4 text-amber-500" />
            ~{pose.calories_burned || 12} cal
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-2 gap-3 mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/80">
        <button
          onClick={() => onViewDetails(pose)}
          className="w-full text-center py-2 px-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        >
          {t('viewDetails')}
        </button>
        
        {isAvoidRecommended ? (
          <button
            disabled
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed text-center"
          >
            Blocked
          </button>
        ) : (
          <button
            onClick={() => onStartPose(pose)}
            className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-soft shadow-emerald-500/10 hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-1"
          >
            <HiPlay className="w-3.5 h-3.5" />
            {t('startPractice')}
          </button>
        )}
      </div>

    </div>
  );
};

export default YogaCard;
