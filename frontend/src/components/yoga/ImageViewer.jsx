import React, { useState, useEffect, useRef } from 'react';
import { HiX, HiZoomIn, HiZoomOut, HiOutlineRefresh } from 'react-icons/hi';

export const ImageViewer = ({
  imageUrl,
  poseName,
  onClose
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  // Reset zoom on image URL change
  useEffect(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, [imageUrl]);

  // Escape key close listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 }); // Reset offset if zoomed back to 1x
      }
      return next;
    });
  };

  const handleReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      handleReset();
    } else {
      setZoomScale(2);
    }
  };

  // Drag-to-pan implementation
  const handleMouseDown = (e) => {
    if (zoomScale === 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale === 1) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fallback visual illustration generator if image fails
  const renderFallbackSVG = () => (
    <div className="w-64 h-64 mx-auto flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
      <svg viewBox="0 0 100 100" className="w-36 h-36" fill="currentColor">
        <circle cx="50" cy="30" r="10" />
        <path d="M50 45c-15 0-25 10-25 25h50c0-15-10-25-25-25z" />
        <path d="M20 75h60v5H20z" />
      </svg>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Toolbar */}
      <div className="relative z-10 bg-black/50 px-6 py-4 flex items-center justify-between text-white border-b border-white/15">
        <div>
          <h3 className="text-base font-black tracking-wide">{poseName}</h3>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">High Resolution Pose View</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleZoomIn} 
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom In"
          >
            <HiZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={handleZoomOut} 
            disabled={zoomScale === 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <HiZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={handleReset} 
            disabled={zoomScale === 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Reset Zoom"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-6 bg-white/20" />
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Close"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className={`flex-1 flex items-center justify-center p-4 relative overflow-hidden ${
          zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div 
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out'
          }}
          onDoubleClick={handleDoubleClick}
          className="max-w-full max-h-[80vh] flex items-center justify-center"
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={poseName}
              loading="lazy"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl select-none"
              onError={(e) => {
                // If local jpg fails, we change it to null so fallback renders
                e.target.style.display = 'none';
                e.target.outerHTML = '';
              }}
            />
          ) : (
            renderFallbackSVG()
          )}
        </div>
      </div>

      {/* Bottom Instructions Info */}
      <div className="bg-black/50 text-white/70 text-center py-4 px-6 text-[10px] font-semibold border-t border-white/10">
        <span>💡 Hint: Double-click to toggle 2x zoom. Drag the image to pan around when zoomed. Press Escape to exit.</span>
      </div>
    </div>
  );
};

export default ImageViewer;
