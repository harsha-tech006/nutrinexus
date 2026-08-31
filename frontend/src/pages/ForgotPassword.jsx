import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFitness, IoMailOutline, IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestForgotPasswordOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      return toast.error('Email address is required.');
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address.');
    }

    setLoading(true);
    const res = await requestForgotPasswordOtp(email.trim());
    setLoading(false);

    if (res.success) {
      toast.success(res.message || 'OTP has been sent to your email address.');
      const targetEmail = res.email || email.trim();
      navigate('/verify-otp', { state: { email: targetEmail } });
    } else {
      toast.error(res.message || 'User not found');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Floating background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-800/80">
        <div className="text-center">
          <div className="flex justify-center text-green-500 mb-3">
            <IoFitness className="w-14 h-14 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Forgot Password</h2>
          <p className="text-sm text-gray-400 mt-1.5">
            Enter your email below and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <IoMailOutline className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                required
              />
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
                Sending OTP...
              </span>
            ) : (
              'Send OTP Code'
            )}
          </button>

          <div className="pt-2 flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 font-semibold transition-colors"
            >
              <IoArrowBack className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
