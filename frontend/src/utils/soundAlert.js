/**
 * Utility to play pleasant notification and reminder chime sounds using Web Audio API
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Play a rich 4-tone chime for Medicine Reminders (C5 -> E5 -> G5 -> C6)
 */
export const playReminderSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playTone = (freq, startTime, duration, type = 'sine', gainVal = 0.2) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Medicine Alarm Chime Sequence (C5, E5, G5, C6)
    playTone(523.25, now, 0.25, 'sine', 0.25);        // C5
    playTone(659.25, now + 0.2, 0.25, 'sine', 0.25);   // E5
    playTone(783.99, now + 0.4, 0.3, 'sine', 0.3);     // G5
    playTone(1046.50, now + 0.65, 0.5, 'sine', 0.35);  // C6 High chime
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

/**
 * Play a quick double-ding for general notifications (A5 -> E6)
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // First chime (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second chime (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.15);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.error("Notification sound error:", err);
  }
};

export default playReminderSound;
