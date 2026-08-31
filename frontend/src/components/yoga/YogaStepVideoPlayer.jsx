import React, { useState, useEffect, useRef } from 'react';
import { 
  HiPlay, 
  HiPause, 
  HiChevronRight, 
  HiChevronLeft, 
  HiRefresh, 
  HiVolumeUp, 
  HiVolumeOff, 
  HiSparkles, 
  HiCheckCircle 
} from 'react-icons/hi';
import { TbYoga } from 'react-icons/tb';

export const YogaStepVideoPlayer = ({ pose, language = 'english' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [stepTimer, setStepTimer] = useState(10); // 10s per step in slideshow
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale / Hold / Exhale
  
  const timerRef = useRef(null);
  const breathTimerRef = useRef(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Extract instructions based on language
  const instructions = pose.translations?.[language]?.instructions || 
    pose.step_by_step_instructions || 
    ["Get into a comfortable starting position.", "Align your spine and focus on your breath.", "Hold the pose steadily while maintaining rhythm.", "Exhale gently and release the pose."];

  const breathing = pose.translations?.[language]?.breathing_instructions || 
    pose.breathing_instructions || 
    ["Deep inhale", "Steady hold", "Slow exhale"];

  const currentStepText = instructions[currentStepIndex] || instructions[0];
  const totalSteps = instructions.length;

  // Speak current step text using speech synthesis
  const speakStep = (text) => {
    if (!synth || !isVoiceEnabled) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`Step ${currentStepIndex + 1}: ${text}`);
    if (language === 'hindi') utterance.lang = 'hi-IN';
    else if (language === 'kannada') utterance.lang = 'kn-IN';
    else utterance.lang = 'en-US';
    synth.speak(utterance);
  };

  // Trigger speech whenever step index changes
  useEffect(() => {
    speakStep(currentStepText);
    setStepTimer(10);
  }, [currentStepIndex]);

  // Breathing animation loop (Inhale 4s -> Hold 2s -> Exhale 4s)
  useEffect(() => {
    let phaseCount = 0;
    breathTimerRef.current = setInterval(() => {
      phaseCount = (phaseCount + 1) % 3;
      if (phaseCount === 0) setBreathPhase('Inhale');
      else if (phaseCount === 1) setBreathPhase('Hold');
      else setBreathPhase('Exhale');
    }, 3500);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, []);

  // Auto-play slideshow timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepTimer((prev) => {
          if (prev <= 1) {
            if (currentStepIndex < totalSteps - 1) {
              setCurrentStepIndex((idx) => idx + 1);
              return 10;
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setStepTimer(10);
    setIsPlaying(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-emerald-950 text-white rounded-3xl p-6 shadow-2xl border border-emerald-500/20 space-y-6 overflow-hidden relative">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TbYoga className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Step-by-Step Procedure</span>
            <h3 className="text-base font-extrabold text-white">{pose.translations?.[language]?.name || pose.name}</h3>
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={() => {
            if (isVoiceEnabled && synth) synth.cancel();
            setIsVoiceEnabled(!isVoiceEnabled);
          }}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            isVoiceEnabled 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-gray-800 text-gray-400 border-gray-700'
          }`}
          title="Toggle Voice Procedure Guidance"
        >
          {isVoiceEnabled ? <HiVolumeUp className="w-5 h-5" /> : <HiVolumeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Animated Visual Demonstration Stage */}
      <div className="relative bg-black/40 rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
        
        {/* Background breathing pulse ring */}
        <div className={`absolute w-56 h-56 rounded-full border-2 border-emerald-500/20 transition-all duration-1000 ${
          breathPhase === 'Inhale' 
            ? 'scale-125 opacity-100 border-emerald-400/40 bg-emerald-500/5' 
            : breathPhase === 'Hold' 
              ? 'scale-125 opacity-80 border-amber-400/40 bg-amber-500/5' 
              : 'scale-90 opacity-40 border-teal-500/20'
        }`} />

        {/* Center Pose SVG Motion Animation */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Animated Motion Vectors */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 transition-all duration-500 transform hover:scale-110">
              <circle cx="50" cy="25" r="8" fill="currentColor" />
              <path 
                d={
                  currentStepIndex % 4 === 0 
                    ? "M50 33 L50 65 M30 85 L50 65 L70 85 M25 45 L50 38 L75 45" 
                    : currentStepIndex % 4 === 1 
                      ? "M50 33 L50 65 M20 85 L50 65 L80 85 M15 30 L50 38 L85 30" 
                      : currentStepIndex % 4 === 2
                        ? "M50 33 L50 60 M40 85 L50 60 L60 85 M30 65 L50 50 L70 65"
                        : "M50 33 C40 45, 60 55, 50 65 M25 80 L50 65 L75 80 M20 50 L50 38 L80 50"
                } 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                fill="none" 
              />
            </svg>
            
            {/* Step Ripple Ring */}
            <span className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" />
          </div>

          {/* Breathing Synchronizer Tag */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
            <HiSparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Breath Guide: <strong className="text-white uppercase tracking-wider">{breathPhase}</strong></span>
          </div>
        </div>

        {/* Step Counter Badge */}
        <div className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-xl text-xs font-extrabold">
          Step {currentStepIndex + 1} of {totalSteps}
        </div>

        {/* Slide timer bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
              style={{ width: `${(stepTimer / 10) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Current Step Instruction Text */}
      <div className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Instruction</span>
          <span className="text-[10px] font-bold text-emerald-400">Step {currentStepIndex + 1}</span>
        </div>
        <p className="text-sm font-semibold text-gray-200 leading-relaxed">
          {currentStepText}
        </p>
      </div>

      {/* Step Dots Navigation Bar */}
      <div className="flex justify-center items-center gap-2">
        {instructions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentStepIndex(idx);
              setIsPlaying(false);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentStepIndex === idx 
                ? 'w-8 bg-emerald-400' 
                : 'w-2 bg-gray-700 hover:bg-gray-500'
            }`}
            title={`Jump to Step ${idx + 1}`}
          />
        ))}
      </div>

      {/* Interactive Controls Panel */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
        
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            currentStepIndex === 0 
              ? 'opacity-40 cursor-not-allowed border-gray-800 text-gray-600' 
              : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <HiChevronLeft className="w-4 h-4" />
          Previous Step
        </button>

        {/* Play/Pause Auto Procedure */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:scale-105 transition-all duration-200"
            title={isPlaying ? "Pause Auto Procedure" : "Play Auto Procedure"}
          >
            {isPlaying ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
            title="Restart Procedure from Step 1"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === totalSteps - 1}
          className={`flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            currentStepIndex === totalSteps - 1 
              ? 'opacity-40 cursor-not-allowed border-gray-800 text-gray-600' 
              : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Next Step
          <HiChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};

export default YogaStepVideoPlayer;
