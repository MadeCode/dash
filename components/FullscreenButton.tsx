'use client';

import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Smartphone } from 'lucide-react';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // Detect iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(isIosDevice);

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    // Check if HTML5 Fullscreen API is available
    if (document.documentElement.requestFullscreen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          toggleIosFallback();
        });
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      // iOS Safari Fallback
      toggleIosFallback();
    }
  };

  const toggleIosFallback = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    
    // Toggle full-bleed CSS class on body
    if (nextState) {
      document.body.classList.add('ios-fullscreen');
      setShowIosTip(true);
      setTimeout(() => setShowIosTip(false), 5000);
    } else {
      document.body.classList.remove('ios-fullscreen');
      setShowIosTip(false);
    }
  };

  return (
    <>
      {/* iOS Safari Tip Notification */}
      {showIosTip && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-50 text-xs px-4 py-2.5 rounded-2xl shadow-2xl z-[1000] flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-top-2">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>iOS Tip: Tap <strong>Share → Add to Home Screen</strong> for full bezel-to-bezel app view.</span>
        </div>
      )}

      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 p-2 text-stone-400 hover:text-stone-600 transition-colors z-50 rounded-xl hover:bg-stone-200/50"
        title={isFullscreen ? 'Exit Fullscreen' : isIos ? 'Toggle iOS Maximize' : 'Enter Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
