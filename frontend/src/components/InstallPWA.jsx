import React, { useState, useEffect } from 'react';
import { HiOutlineDownload, HiX, HiShare, HiOutlineDeviceMobile, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for Chrome / Android / Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa_install_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      toast.success('🎉 NutriNexus App successfully installed on your Home Screen!', { duration: 5000 });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction for browsers without direct prompt event
      toast('To install: Open browser menu (⋮) and tap "Add to Home Screen" or "Install App"', {
        icon: '📱',
        duration: 5000
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Top Header Button / Banner trigger */}
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all animate-pulse"
        title="Install NutriNexus as App on your Phone / Desktop"
      >
        <HiOutlineDeviceMobile className="w-4 h-4 text-emerald-200" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Floating Bottom Installation Banner (Mobile & Desktop Prompt) */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-white dark:bg-gray-900 border border-emerald-500/30 rounded-3xl p-4 shadow-2xl backdrop-blur-md transition-all animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                N
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>NutriNexus App</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Mobile & Offline
                  </span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Install on your phone for instant offline access & push notifications!
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <HiOutlineDownload className="w-4 h-4" />
              <span>Install NutriNexus App</span>
            </button>
            <button
              onClick={dismissBanner}
              className="px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl">
              📲
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                Install NutriNexus on iPhone / iPad
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Follow these simple steps in Safari to add NutriNexus to your Home Screen:
              </p>
            </div>

            <div className="space-y-2.5 text-left bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span>Tap the <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold flex inline-flex items-center gap-1">Share <HiShare className="w-3.5 h-3.5 inline" /></strong> icon at the bottom of Safari.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span>Scroll down and select <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Add to Home Screen ➕</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span>Tap <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Add</strong> to launch NutriNexus as a standalone phone app!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
