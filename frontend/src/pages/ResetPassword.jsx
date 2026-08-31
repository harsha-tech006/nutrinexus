import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoFitness, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password criteria check
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Redirect if context values are missing
  useEffect(() => {
    if (!email || !otp) {
      toast.error('Session expired. Please request a new verification code.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  // Track password strength dynamically
  useEffect(() => {
    setCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password)
    });
  }, [password]);

  const strengthCount = Object.values(criteria).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: 'None', color: 'bg-slate-800' };
    if (strengthCount <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strengthCount <= 4) return { label: 'Fair', color: 'bg-orange-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (strengthCount < 5) {
      return toast.error('Please meet all password complexity requirements.');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setLoading(true);
    const res = await resetPassword(email, otp, password, confirmPassword);
    setLoading(false);

    if (res.success) {
      toast.success('Password changed successfully! You can now log in.');
      navigate('/login');
    } else {
      toast.error(res.message || 'Failed to reset password. Please try again.');
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
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
            Enter your new secure password details for <span className="text-green-400 font-semibold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <IoLockClosedOutline className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <IoLockClosedOutline className="w-5 h-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Strength Meter */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold">Password Strength:</span>
              <span className={`font-bold uppercase ${getStrengthLabel().label === 'Strong' ? 'text-green-400' : getStrengthLabel().label === 'Fair' ? 'text-orange-400' : 'text-red-400'}`}>
                {getStrengthLabel().label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 h-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-full rounded-full transition-colors duration-300 ${
                    level <= strengthCount ? getStrengthLabel().color : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-2xs sm:text-xs pt-1.5 border-t border-slate-800/60">
              <div className={`flex items-center gap-1.5 font-medium ${criteria.length ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.length ? 'bg-green-400' : 'bg-slate-800'}`} />
                Min 8 characters
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${criteria.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.uppercase ? 'bg-green-400' : 'bg-slate-800'}`} />
                One uppercase letter
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${criteria.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.lowercase ? 'bg-green-400' : 'bg-slate-800'}`} />
                One lowercase letter
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${criteria.number ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.number ? 'bg-green-400' : 'bg-slate-800'}`} />
                One number (0-9)
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${criteria.special ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${criteria.special ? 'bg-green-400' : 'bg-slate-800'}`} />
                One special character
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm pt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
