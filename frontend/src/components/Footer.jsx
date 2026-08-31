import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 py-4 px-4 text-center mt-auto transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} NutriNexus - AI Nutrition Assistant. All rights reserved.</p>
        <p className="max-w-md text-[10px] md:text-right text-gray-400 dark:text-gray-500">
          Disclaimer: Recommendations provided by NutriNexus are for educational purposes only. Always consult a healthcare specialist before making medical or extreme diet changes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
