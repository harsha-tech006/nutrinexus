import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFitness, IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyForgotPasswordOtp, requestForgotPasswordOtp } = useAuth();
  
  // Get email from location state
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [successAnimated, setSuccessAnimated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Timer: 60 seconds countdown
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Redirect back if email context is missing
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please request a new code.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0 && resendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown, resendDisabled]);

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1].current.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const otpDigits = pasteData.split('');
      setOtp(otpDigits);
      inputRefs[5].current.focus();
    } else {
      toast.error('Please paste a valid 6-digit verification code.');
    }
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    setLoading(true);
    const res = await requestForgotPasswordOtp(email);
    setLoading(false);

    if (res.success) {
      toast.success('Verification code resent successfully.');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setResendDisabled(true);
      setAttempts(0); // Reset attempts count on resend
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    } else {
      toast.error(res.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      return toast.error('Please enter the complete 6-digit code.');
    }

    if (attempts >= 5) {
      toast.error('Maximum attempts exceeded. Please request a new OTP.');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);
    const res = await verifyForgotPasswordOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      setSuccessAnimated(true);
      toast.success('OTP code verified successfully!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email, otp: otpCode } });
      }, 1500);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      toast.error(res.message || 'Invalid OTP code. Please try again.');
      
      if (nextAttempts >= 5) {
        toast.error('Maximum verification attempts exceeded. Locked out!');
        navigate('/forgot-password');
      }
    }
  };

  if (successAnimated) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="w-full max-w-md relative z-10 text-center space-y-6 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/80 shadow-2xl animate-scale-in">
          <div className="flex justify-center text-green-400">
            <IoCheckmarkCircle className="w-24 h-24 stroke-current stroke-1 fill-none animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white">Verification Successful</h2>
          <p className="text-sm text-gray-400 font-medium">OTP code verified successfully. Opening password reset page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Floating background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-800/80">
        <div className="text-center">
          <div className="flex justify-center text-green-500 mb-3">
            <IoFitness className="w-14 h-14 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white">Verify OTP</h2>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
            We have sent a verification code to <span className="text-green-400 font-semibold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block text-center">
              Verification Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-12 text-center text-xl font-bold bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-white transition-all"
                  required
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/forgot-password"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 font-semibold transition-colors"
            >
              <IoArrowBack className="w-3.5 h-3.5" />
              Change Email
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled || loading}
              className="text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-green-400 hover:text-green-300"
            >
              {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
