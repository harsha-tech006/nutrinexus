import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  HiPlay, 
  HiPause, 
  HiChevronRight,
  HiOutlineVolumeUp, 
  HiOutlineRefresh,
  HiClock
} from 'react-icons/hi';
import { TbSquareRoundedChevronsRight, TbSquareRoundedX } from 'react-icons/tb';
import api from '../../services/api';
import { LanguageContext } from '../../context/LanguageContext';

export const YogaAudioPlayer = ({
  pose,
  onCompletedListening = null
}) => {
  const { language } = useContext(LanguageContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [rate, setRate] = useState(1); // 0.5 to 2
  const [progress, setProgress] = useState(0); // in seconds
  
  const synth = window.speechSynthesis;
  const progressTimer = useRef(null);
  
  const totalDuration = pose.duration_sec || 60;

  // Localized narration text generation
  const getNarrationText = () => {
    const hasTranslation = pose.translations && pose.translations[language];
    const name = hasTranslation?.name || pose.name;
    const sanskrit = pose.sanskrit_name || '';
    const desc = hasTranslation?.short_description || pose.short_description || '';
    const steps = hasTranslation?.instructions || pose.step_by_step_instructions || [];
    const breathing = hasTranslation?.breathing_instructions || pose.breathing_instructions || [];
    const mistakes = hasTranslation?.common_mistakes || pose.common_mistakes || [];
    const safety = hasTranslation?.safety_precautions || pose.safety_precautions || [];

    return `
      Introducing ${name}. Sanskrit name is ${sanskrit}. 
      Description: ${desc}. 
      Starting position and alignment: ${steps.join('. ')}. 
      Breathing details: ${breathing.join('. ')}. 
      Safety tips: ${safety.join('. ')}. 
      Common mistakes to avoid: ${mistakes.join('. ')}. 
      Hold this position for ${totalDuration} seconds.
    `;
  };

  // Sync listening progress to server
  const syncListeningProgress = async (completed = false) => {
    try {
      await api.post('/guide/yogas/listen', {
        pose_id: pose._id,
        listened_sec: progress,
        total_sec: totalDuration,
        completed_listening: completed
      });
    } catch (err) {
      console.error('Error syncing listening progress:', err);
    }
  };

  // Periodic progress tracker sync
  useEffect(() => {
    if (isPlaying && !isPaused) {
      progressTimer.current = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          if (next >= totalDuration) {
            handleStop(true);
            return totalDuration;
          }
          // Sync to server every 10 seconds
          if (next % 10 === 0) {
            syncListeningProgress(false);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(progressTimer.current);
    }

    return () => clearInterval(progressTimer.current);
  }, [isPlaying, isPaused, totalDuration]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!synth) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.cancel(); // cancel any active utterance
    const text = getNarrationText();
    const utterance = new SpeechSynthesisUtterance(text);

    // Setup speech configurations
    utterance.volume = volume;
    utterance.rate = rate;
    
    if (language === 'hindi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'kannada') {
      utterance.lang = 'kn-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      handleStop(true);
    };

    utterance.onerror = () => {
      handleStop(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    synth.speak(utterance);
  };

  const handlePause = () => {
    if (synth && synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
      syncListeningProgress(false);
    }
  };

  const handleStop = (completed = false) => {
    if (synth) {
      synth.cancel();
    }
    clearInterval(progressTimer.current);
    setIsPlaying(false);
    setIsPaused(false);
    if (completed) {
      setProgress(totalDuration);
      syncListeningProgress(true);
      if (onCompletedListening) onCompletedListening();
    } else {
      setProgress(0);
      syncListeningProgress(false);
    }
  };

  const handleReplay = () => {
    setProgress(0);
    handlePlay();
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (synth && synth.speaking) {
      // Re-trigger play with new volume if speaking
      // Unfortunately Web Speech API volume cannot be set dynamically on an active utterance in all browsers
      // So we change it for the next utterances.
    }
  };

  const handleSpeedChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    if (isPlaying) {
      // Re-trigger synthesis to apply speed changes instantly
      synth.cancel();
      const text = getNarrationText();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume;
      utterance.rate = newRate;
      utterance.onend = () => handleStop(true);
      synth.speak(utterance);
    }
  };

  // Convert progress seconds to format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percentProgress = (progress / totalDuration) * 100;

  return (
    <div className="bg-gray-900 text-white rounded-3xl p-5 border border-gray-800 shadow-xl space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <HiOutlineVolumeUp className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider">Voice Audio Guide</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
          <HiClock className="w-3.5 h-3.5" />
          <span>Duration: {formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Progress Timeline Indicator */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div className="relative w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${percentProgress}%` }}
          />
        </div>
      </div>

      {/* Primary Audio Player Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Play / Pause / Resume / Stop Buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:scale-105 transition-all duration-200"
              title="Play Audio"
            >
              <HiPlay className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:scale-105 transition-all duration-200"
              title="Pause Audio"
            >
              <HiPause className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleStop(false)}
            className="p-3 rounded-full bg-red-600 hover:bg-red-750 text-white shadow-md hover:scale-105 transition-all duration-200"
            title="Stop Audio"
          >
            <TbSquareRoundedX className="w-4 h-4" />
          </button>

          <button
            onClick={handleReplay}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 shadow-sm transition-colors"
            title="Replay"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 bg-gray-850 px-3 py-1.5 rounded-xl border border-gray-800/80">
          <HiOutlineVolumeUp className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 rounded-lg appearance-none bg-gray-700 cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Playback Speed selector */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-gray-500 font-black uppercase">Speed:</span>
          <select
            value={rate}
            onChange={handleSpeedChange}
            className="bg-gray-800 border border-gray-700 text-white text-[10px] font-black rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>
        </div>

      </div>

    </div>
  );
};

export default YogaAudioPlayer;
