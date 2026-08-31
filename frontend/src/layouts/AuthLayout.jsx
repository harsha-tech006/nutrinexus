import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-emerald-100 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/80 p-8 relative overflow-hidden">
        {/* Decorative backdrop gradients */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-green-200/40 dark:bg-green-800/10 blur-xl"></div>
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-teal-200/40 dark:bg-teal-800/10 blur-xl"></div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
