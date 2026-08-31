import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Layout
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import OTPVerification from '../pages/OTPVerification';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import DailyTracker from '../pages/DailyTracker';
import MonthlyReport from '../pages/MonthlyReport';
import WeeklyReport from '../pages/WeeklyReport';
import HealthAssistant from '../pages/HealthAssistant';
import AINutritionAssistantChat from '../pages/AINutritionAssistantChat';
import DiseaseGuide from '../pages/DiseaseGuide';
import MedicineReminder from '../pages/MedicineReminder';
import YogaGuide from '../pages/YogaGuide';
import FoodRecommendation from '../pages/FoodRecommendation';
import WaterReminder from '../pages/WaterReminder';
import GoalTracker from '../pages/GoalTracker';
import History from '../pages/History';
import Settings from '../pages/Settings';
import Notifications from '../pages/Notifications';
import HospitalsLocator from '../pages/HospitalsLocator';
import PregnancyNutrition from '../pages/PregnancyNutrition';
import MenstrualCycleTracker from '../pages/MenstrualCycleTracker';
import HealthConditionMonitor from '../pages/HealthConditionMonitor';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AnonymousRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <AnonymousRoute>
          <AuthLayout><Login /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/register" element={
        <AnonymousRoute>
          <AuthLayout><Register /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/forgot-password" element={
        <AnonymousRoute>
          <AuthLayout><ForgotPassword /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/forgot_password" element={
        <AnonymousRoute>
          <AuthLayout><ForgotPassword /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/verify-otp" element={
        <AnonymousRoute>
          <AuthLayout><OTPVerification /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/verify_otp" element={
        <AnonymousRoute>
          <AuthLayout><OTPVerification /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/reset-password" element={
        <AnonymousRoute>
          <AuthLayout><ResetPassword /></AuthLayout>
        </AnonymousRoute>
      } />
      <Route path="/reset_password" element={
        <AnonymousRoute>
          <AuthLayout><ResetPassword /></AuthLayout>
        </AnonymousRoute>
      } />

      {/* App Main Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
      <Route path="/daily-tracker" element={<ProtectedRoute><MainLayout><DailyTracker /></MainLayout></ProtectedRoute>} />
      <Route path="/weekly-report" element={<ProtectedRoute><MainLayout><WeeklyReport /></MainLayout></ProtectedRoute>} />
      <Route path="/monthly-report" element={<ProtectedRoute><MainLayout><MonthlyReport /></MainLayout></ProtectedRoute>} />
      <Route path="/health-assistant" element={<ProtectedRoute><MainLayout><HealthAssistant /></MainLayout></ProtectedRoute>} />
      <Route path="/ai-chat" element={<ProtectedRoute><MainLayout><AINutritionAssistantChat /></MainLayout></ProtectedRoute>} />
      <Route path="/disease-guide" element={<ProtectedRoute><MainLayout><DiseaseGuide /></MainLayout></ProtectedRoute>} />
      <Route path="/medicine-reminder" element={<ProtectedRoute><MainLayout><MedicineReminder /></MainLayout></ProtectedRoute>} />
      <Route path="/yoga-guide" element={<ProtectedRoute><MainLayout><YogaGuide /></MainLayout></ProtectedRoute>} />
      <Route path="/food-recommendation" element={<ProtectedRoute><MainLayout><FoodRecommendation /></MainLayout></ProtectedRoute>} />
      <Route path="/water-reminder" element={<ProtectedRoute><MainLayout><WaterReminder /></MainLayout></ProtectedRoute>} />
      <Route path="/goal-tracker" element={<ProtectedRoute><MainLayout><GoalTracker /></MainLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><MainLayout><History /></MainLayout></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><MainLayout><HospitalsLocator /></MainLayout></ProtectedRoute>} />
      <Route path="/pregnancy-nutrition" element={<ProtectedRoute><MainLayout><PregnancyNutrition /></MainLayout></ProtectedRoute>} />
      <Route path="/cycle-tracker" element={<ProtectedRoute><MainLayout><MenstrualCycleTracker /></MainLayout></ProtectedRoute>} />
      <Route path="/health-monitor" element={<ProtectedRoute><MainLayout><HealthConditionMonitor /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notifications /></MainLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
