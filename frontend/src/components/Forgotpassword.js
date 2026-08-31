import React, { useState } from 'react';
import { authService } from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [method, setMethod] = useState('email');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(0);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.forgotPassword({
                email_or_phone: emailOrPhone,
                method: method
            });
            
            setSuccess(response.data.message);
            setStep(2);
            startTimer();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.verifyOTP({
                email_or_phone: emailOrPhone,
                otp: otp
            });
            
            if (response.data.verified) {
                setSuccess('OTP verified successfully!');
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.resetPassword({
                email_or_phone: emailOrPhone,
                new_password: newPassword,
                otp: otp
            });
            
            setSuccess('Password reset successfully!');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.resendOTP({
                email_or_phone: emailOrPhone,
                method: method
            });
            
            setSuccess('New OTP sent successfully!');
            startTimer();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {step === 1 && (
                    <form onSubmit={handleForgotPassword}>
                        <div className="form-group">
                            <label>Email or Phone Number</label>
                            <input
                                type="text"
                                value={emailOrPhone}
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                placeholder="Enter your email or phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Send OTP via</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        value="email"
                                        checked={method === 'email'}
                                        onChange={(e) => setMethod(e.target.value)}
                                    />
                                    Email
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="sms"
                                        checked={method === 'sms'}
                                        onChange={(e) => setMethod(e.target.value)}
                                    />
                                    SMS
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                        
                        <div className="auth-links">
                            <a href="/login">Back to Login</a>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="otp-message">
                            <p>We've sent a 6-digit OTP to your {method === 'email' ? 'email' : 'phone'}.</p>
                            <p className="otp-timer">
                                {timer > 0 ? `Resend OTP in ${timer}s` : 'OTP expired'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        {timer === 0 && (
                            <button 
                                type="button" 
                                onClick={handleResendOTP}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        )}
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;