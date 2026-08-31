import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../services/api';
import { 
  HiOutlineChatAlt, 
  HiOutlineTrash, 
  HiOutlineSparkles,
  HiOutlineMicrophone,
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiOutlineTranslate,
  HiOutlineCog
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { LanguageContext } from '../context/LanguageContext';

export const AINutritionAssistantChat = () => {
  const { language: globalLang } = useContext(LanguageContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState('hi-IN'); // Default to Hindi for easy voice access
  const [speechRate, setSpeechRate] = useState(0.9); // 0.9x speed for clear elder/uneducated comprehension

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Supported Multilingual Speech Languages
  const voiceLanguages = [
    { code: 'hi-IN', name: '🇮🇳 हिन्दी (Hindi)', label: 'Hindi' },
    { code: 'kn-IN', name: '🇮🇳 ಕನ್ನಡ (Kannada)', label: 'Kannada' },
    { code: 'ta-IN', name: '🇮🇳 தமிழ் (Tamil)', label: 'Tamil' },
    { code: 'te-IN', name: '🇮🇳 తెలుగు (Telugu)', label: 'Telugu' },
    { code: 'ml-IN', name: '🇮🇳 മലയാളം (Malayalam)', label: 'Malayalam' },
    { code: 'mr-IN', name: '🇮🇳 मराठी (Marathi)', label: 'Marathi' },
    { code: 'gu-IN', name: '🇮🇳 ગુજરાતી (Gujarati)', label: 'Gujarati' },
    { code: 'bn-IN', name: '🇮🇳 বাংলা (Bengali)', label: 'Bengali' },
    { code: 'en-IN', name: '🇬🇧 English (India)', label: 'English' }
  ];

  // Quick Voice Prompts for Uneducated / Elder Accessibility
  const quickVoicePrompts = [
    { text: 'आज मुझे दोपहर के खाने में क्या खाना चाहिए?', lang: 'hi-IN', label: '🥗 दोपहर का खाना (Hindi)' },
    { text: 'షుగర్ వ్యాధికి ఏ ఆహారం చాలా మంచిది?', lang: 'te-IN', label: '🩺 షుగర్ ડાયેટ (Telugu)' },
    { text: 'ರಕ್ತದೊತ್ತಡಕ್ಕೆ ಸೂಕ್ತವಾದ ಆಹಾರ ಯಾವುದು?', lang: 'kn-IN', label: '💧 ರಕ್ತದೊತ್ತಡ (Kannada)' },
    { text: 'உயர் இரத்த அழுத்தத்திற்கான உணவு முறை', lang: 'ta-IN', label: '🌾 தமிழ் உணவு (Tamil)' },
    { text: 'What is the best daily meal plan for health?', lang: 'en-IN', label: '🍎 Daily Meal Plan (English)' }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Sync default voice language from app context
  useEffect(() => {
    if (globalLang) {
      const matched = voiceLanguages.find(v => v.label.toLowerCase() === globalLang.toLowerCase());
      if (matched) {
        setVoiceLanguage(matched.code);
      }
    }
  }, [globalLang]);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = voiceLanguage;
      try {
        recognitionRef.current.start();
        const langObj = voiceLanguages.find(v => v.code === voiceLanguage);
        toast.success(`Listening in ${langObj?.name || 'your language'}... Speak now! 🎙️`);
      } catch (err) {
        console.error('Speech recognition start failed:', err);
      }
    }
  };

  const speakText = (text, messageId) => {
    if (!synthRef.current) return;

    if (currentlySpeakingId === messageId) {
      synthRef.current.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    synthRef.current.cancel(); // Stop existing speech

    // Clean text: strip markdown code, asterisks, hash signs, etc.
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/###/g, '')
      .replace(/- /g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLanguage;
    utterance.rate = speechRate; // 0.9x for elder clarity

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(messageId);
    synthRef.current.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/ai/chat/history').catch(() => null);
        if (res?.data?.history?.messages) {
          setMessages(res.data.history.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setMessages([]);
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setLoading(true);

    try {
      const selectedLangObj = voiceLanguages.find(v => v.code === voiceLanguage);
      const targetLangName = selectedLangObj?.label || 'Hindi';

      const res = await api.post('/ai/chat', { 
        message: currentQuery, 
        language: targetLangName 
      }).catch(() => null);
      
      const assistantContent = res?.data?.message?.content || res?.data?.response || 
        `I am here to support your nutrition and health goals. Please ensure you stay well-hydrated with 2.5L to 3.5L of water daily and consume balanced meals.`;

      const assistantMsg = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => {
        const nextMessages = [...prev, assistantMsg];
        if (isAutoSpeakEnabled) {
          setTimeout(() => {
            speakText(assistantMsg.content, nextMessages.length - 1);
          }, 100);
        }
        return nextMessages;
      });
    } catch (err) {
      console.error(err);
      const fallbackMsg = {
        role: 'assistant',
        content: `I am here to support your health goals. Please drink plenty of water and maintain a healthy, balanced diet.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      try {
        await api.delete('/ai/chat/history');
        if (synthRef.current) {
          synthRef.current.cancel();
        }
        setCurrentlySpeakingId(null);
        setMessages([]);
        toast.success('Chat history cleared.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to clear chat.');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl overflow-hidden shadow-soft">
      
      {/* Multilingual Voice Assistant Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
            <HiOutlineMicrophone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-base flex items-center gap-2">
              <span>Multilingual Voice AI Assistant</span>
              <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Natural Speech</span>
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Talk & Listen in your local language • Easy for elders & uneducated users 🗣️👂
            </p>
          </div>
        </div>

        {/* Voice Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Voice Language Selector */}
          <div className="flex items-center gap-1 bg-white/10 dark:bg-black/20 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold">
            <HiOutlineTranslate className="w-4 h-4 text-emerald-200" />
            <select
              value={voiceLanguage}
              onChange={(e) => {
                setVoiceLanguage(e.target.value);
                const obj = voiceLanguages.find(v => v.code === e.target.value);
                toast.success(`Voice Assistant set to ${obj?.name}`);
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
            >
              {voiceLanguages.map((vl) => (
                <option key={vl.code} value={vl.code} className="text-gray-900 bg-white">
                  {vl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Speak Response Toggle */}
          <button
            type="button"
            onClick={() => {
              if (currentlySpeakingId !== null) {
                synthRef.current?.cancel();
                setCurrentlySpeakingId(null);
              }
              setIsAutoSpeakEnabled(!isAutoSpeakEnabled);
              toast.success(isAutoSpeakEnabled ? 'Auto-Voice disabled' : 'Auto-Voice enabled: AI will read out answers!');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isAutoSpeakEnabled 
                ? 'bg-white text-emerald-700 border-white shadow-sm' 
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title={isAutoSpeakEnabled ? "Disable Auto Read Aloud" : "Enable Auto Read Aloud"}
          >
            {isAutoSpeakEnabled ? <HiOutlineVolumeUp className="w-4 h-4 text-emerald-600" /> : <HiOutlineVolumeOff className="w-4 h-4" />}
            <span>{isAutoSpeakEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Clear History */}
          {messages.length > 0 && (
            <button 
              onClick={handleClear}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
              title="Clear Chat History"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Prompt Suggestions for Uneducated / Elders */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 px-4 py-2.5 border-b border-emerald-100/50 dark:border-emerald-900/20 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0 flex items-center gap-1">
          <span>🗣️ Tap to Speak:</span>
        </span>
        {quickVoicePrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setVoiceLanguage(q.lang);
              setInput(q.text);
              toast.success(`Language switched to ${q.label}`);
            }}
            className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 font-bold px-3 py-1 rounded-full shrink-0 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all shadow-2xs"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Message logs area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {fetchingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <HiOutlineMicrophone className="w-10 h-10" />
            </div>
            
            <div>
              <h4 className="font-extrabold text-gray-800 dark:text-gray-100 text-base">Speak in Your Native Language</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                Tap the big mic button below to talk naturally in Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Gujarati, or English. The AI will speak the answer back to you!
              </p>
            </div>

            <button
              onClick={toggleListen}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <HiOutlineMicrophone className="w-5 h-5" />
              <span>Tap Here to Speak Now</span>
            </button>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-emerald-500 text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200/40 dark:border-gray-700/40'
                }`}>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-black/5 dark:border-white/5 gap-4">
                    {!isUser ? (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content, index)}
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                          currentlySpeakingId === index
                            ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40'
                            : 'text-gray-500 hover:text-emerald-500 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                        }`}
                        title={currentlySpeakingId === index ? "Stop Speaking" : "Read Aloud in Native Language"}
                      >
                        <HiOutlineVolumeUp className={`w-4 h-4 ${currentlySpeakingId === index ? 'animate-pulse text-emerald-500' : ''}`} />
                        <span>{currentlySpeakingId === index ? 'Speaking...' : '🔊 Read Aloud'}</span>
                      </button>
                    ) : <div />}
                    
                    <span className={`block text-[9px] text-right ${isUser ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-200/20 dark:border-gray-700/30 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
              </div>
              <span className="text-xs font-semibold text-gray-500">AI is thinking and preparing voice answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box form with large Mic button */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Speak or type in ${voiceLanguages.find(v => v.code === voiceLanguage)?.label || 'your language'}...`}
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        
        {/* Multilingual Voice Recording Mic Button */}
        <button
          type="button"
          onClick={toggleListen}
          className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-xs ${
            isListening
              ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-md shadow-red-500/20'
              : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'
          }`}
          title={isListening ? "Listening... Tap to Stop" : "Tap to Speak"}
        >
          <HiOutlineMicrophone className={`w-5 h-5 ${isListening ? 'scale-125 animate-bounce' : ''}`} />
          <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Speak'}</span>
        </button>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gray-900 hover:bg-black dark:bg-gray-100 dark:text-gray-900 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-md disabled:opacity-40"
        >
          Send
        </button>
      </form>

    </div>
  );
};

export default AINutritionAssistantChat;
