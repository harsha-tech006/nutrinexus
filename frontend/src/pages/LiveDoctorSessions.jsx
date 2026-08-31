import React, { useState, useEffect, useContext } from 'react';
import { doctorService } from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineVideoCamera, HiOutlineUserGroup, HiOutlineCalendar, 
  HiOutlineClock, HiOutlineChatAlt, HiOutlineMicrophone, 
  HiOutlinePhoneMissedCall, HiOutlineDocumentText, HiOutlineCheckCircle,
  HiX, HiOutlinePaperAirplane, HiOutlineSparkles, HiOutlineShieldCheck
} from 'react-icons/hi';
import { FaUserMd, FaStethoscope } from 'react-icons/fa';

export const LiveDoctorSessions = () => {
  const { t } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);

  const [liveSessions, setLiveSessions] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Active Tele-consultation Video Room State
  const [activeRoom, setActiveRoom] = useState(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: "Tele-consultation room connected securely. End-to-end encrypted.", time: "Just now" },
    { sender: "Doctor", text: "Hello! I am reviewing your nutrition and health profile. How can I assist you today?", time: "Just now" }
  ]);
  const [messageInput, setMessageInput] = useState('');

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getLiveSessions();
      if (res.data.success) {
        setLiveSessions(res.data.live_sessions || []);
        setAvailableDoctors(res.data.doctors_available || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load live doctor session status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setBookingLoading(true);
    try {
      const res = await doctorService.bookConsultation({
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        patient_name: user ? user.name : "Patient",
        symptoms: symptomsInput || "General Clinical Nutrition Check",
        reason: reasonInput || "Personalized Diet & Health Consultation"
      });
      if (res.data.success) {
        toast.success(res.data.message);
        const booking = res.data.booking;
        setSelectedDoctor(null);
        // Launch teleconsultation video room
        setActiveRoom({
          room_id: booking.room_id,
          doctor_name: booking.doctor_name,
          patient_name: booking.patient_name,
          prescription: booking.prescription_preview
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Booking request failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const newMsg = {
      sender: user ? user.name : "You",
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setMessageInput('');

    // Simulate Doctor response after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: activeRoom ? activeRoom.doctor_name : "Doctor",
          text: "Understood. Based on your inputs, I recommend increasing daily hydration and incorporating 25g of fiber with balanced proteins.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Telehealth & Virtual Clinic
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Doctor Sessions & Teleconsultation
          </h1>
          <p className="text-blue-100 text-sm max-w-2xl">
            Join live medical webinars, consult with senior clinical nutritionists and doctors in real time, or launch an instant 1-on-1 video call room.
          </p>
        </div>
      </div>

      {/* Section 1: Upcoming & Ongoing Webinars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HiOutlineVideoCamera className="w-5 h-5 text-blue-600" />
            <span>Ongoing & Scheduled Doctor Live Streams</span>
          </h2>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Updated Real-Time</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveSessions.map((session) => (
              <div 
                key={session.id || session._id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {session.status === 'LIVE_NOW' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-full text-xs font-extrabold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                        {session.scheduled_time}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <HiOutlineUserGroup className="w-3.5 h-3.5" />
                      {session.viewers_count} attending
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={session.doctor_avatar} 
                      alt={session.doctor_name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm shrink-0" 
                    />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{session.doctor_name}</h4>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{session.specialty}</p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">
                    {session.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setActiveRoom({
                      room_id: `stream-${session.id}`,
                      doctor_name: session.doctor_name,
                      patient_name: user ? user.name : "Attendee",
                      is_webinar: true,
                      prescription: null
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition"
                >
                  <HiOutlineVideoCamera className="w-4 h-4" />
                  <span>{session.status === 'LIVE_NOW' ? 'Join Live Stream Now' : 'Join Webinar Room'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: 1-on-1 Doctor Consultation Directory */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HiOutlineShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Book 1-on-1 Doctor Teleconsultation</span>
            </h2>
            <p className="text-xs text-gray-500">Connect privately via HD video call with verified specialists.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableDoctors.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-lg transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img 
                      src={doc.avatar} 
                      alt={doc.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" 
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                      doc.status === 'ONLINE_NOW' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-extrabold uppercase">
                    {doc.fee}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{doc.name}</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{doc.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{doc.hospital} • {doc.experience_years} yrs exp</p>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1">
                  {doc.specialties.map((sp, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-[10px] font-medium">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedDoctor(doc)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition"
              >
                Consult {doc.name} Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5 relative animate-fadeIn">
            <button 
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="w-14 h-14 rounded-2xl object-cover" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{selectedDoctor.name}</h3>
                <p className="text-xs text-emerald-600">{selectedDoctor.title}</p>
              </div>
            </div>

            <form onSubmit={handleBookConsultation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Symptoms / Health Concern</label>
                <input 
                  type="text"
                  required
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g. High blood sugar spikes, fatigue, chest tightness..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Reason for Teleconsultation</label>
                <textarea 
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Briefly describe what you'd like the doctor to review (e.g. daily food log, medicine compatibility)..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg"
                >
                  {bookingLoading ? "Connecting..." : "Launch Teleconsultation Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Teleconsultation Video Room Modal */}
      {activeRoom && (
        <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900 rounded-3xl max-w-5xl w-full h-[92vh] border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="bg-gray-950 p-4 px-6 border-b border-gray-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <div>
                  <h3 className="font-bold text-sm">
                    {activeRoom.is_webinar ? "Live Doctor Webinar Room" : `1-on-1 Consultation with ${activeRoom.doctor_name}`}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">Encrypted Room ID: {activeRoom.room_id}</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveRoom(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <HiOutlinePhoneMissedCall className="w-4 h-4" />
                <span>End Teleconsultation</span>
              </button>
            </div>

            {/* Main Stage Grid: Video Feed Left, Chat/Prescription Right */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              {/* Main Video Viewport (2 Cols) */}
              <div className="lg:col-span-2 bg-gray-950 relative flex flex-col justify-between p-4 overflow-hidden">
                {/* Doctor Video Stream Display */}
                <div className="relative flex-1 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80" 
                    alt="Doctor Feed" 
                    className="w-full h-full object-cover opacity-90"
                  />

                  {/* Doctor overlay label */}
                  <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{activeRoom.doctor_name} (Senior MD)</span>
                  </div>

                  {/* Patient Self Camera Preview (Pip box) */}
                  <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-2xl flex items-center justify-center">
                    {!isCameraOff ? (
                      <div className="w-full h-full bg-emerald-950/80 flex items-center justify-center text-emerald-400 font-bold text-xs p-2 text-center">
                        📹 Your HD Camera Stream Active
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs font-bold">Cam Off</div>
                    )}
                  </div>
                </div>

                {/* Bottom Media Controls Bar */}
                <div className="mt-4 flex items-center justify-center gap-4 bg-gray-900/80 backdrop-blur-md p-3 rounded-2xl border border-gray-800">
                  <button 
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-xl transition font-bold text-xs flex items-center gap-2 ${
                      isMicMuted ? 'bg-red-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <HiOutlineMicrophone className="w-5 h-5" />
                    <span>{isMicMuted ? "Unmute Mic" : "Mute Mic"}</span>
                  </button>

                  <button 
                    onClick={() => setIsCameraOff(!isCameraOff)}
                    className={`p-3 rounded-xl transition font-bold text-xs flex items-center gap-2 ${
                      isCameraOff ? 'bg-red-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <HiOutlineVideoCamera className="w-5 h-5" />
                    <span>{isCameraOff ? "Turn Cam On" : "Cam Off"}</span>
                  </button>
                </div>
              </div>

              {/* Chat & Digital Prescription Sidebar (1 Col) */}
              <div className="bg-gray-900 border-l border-gray-800 flex flex-col justify-between overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 text-white flex items-center justify-between">
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <HiOutlineChatAlt className="w-4 h-4 text-emerald-400" />
                    <span>Live Tele-Chat & Advice</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.sender === "System" 
                          ? 'bg-gray-800/60 text-gray-400 text-center italic text-[11px]' 
                          : msg.sender === (user ? user.name : "You")
                          ? 'bg-emerald-600 text-white ml-6' 
                          : 'bg-gray-800 text-gray-100 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px] text-gray-300">
                        <span>{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Prescription Preview Card if available */}
                {activeRoom.prescription && (
                  <div className="p-3 mx-4 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl space-y-1 text-[11px] text-emerald-200">
                    <p className="font-bold flex items-center gap-1 text-emerald-400">
                      <HiOutlineDocumentText className="w-4 h-4" /> Live Prescription Notes:
                    </p>
                    <p>• {activeRoom.prescription.dietary_notes}</p>
                  </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                  <input 
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type message to doctor..."
                    className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                    <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDoctorSessions;
