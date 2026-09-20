import React, { useState, useRef } from 'react';

export default function CustomSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  icon: Icon,
  helperText,
  id
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const trackRef = useRef(null);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Dynamic gradient from eco-emerald to warm amber to active rose
  const trackBackground = `linear-gradient(to right, #10b981 0%, #f59e0b 65%, #ef4444 100%)`;

  // Mathematical formula matching 24px thumb travel across full width
  const thumbLeft = `calc(12px + ${(percentage / 100)} * (100% - 24px))`;

  // Direct tap & drag handler on the progress stick
  const handlePointerDown = (e) => {
    // Only respond to primary click (button 0) or touch
    if (e.button !== undefined && e.button !== 0) return;
    const container = trackRef.current;
    if (!container) return;

    const updateFromPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clickX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const pct = clickX / rect.width;
      const rawVal = min + pct * (max - min);
      const stepsCount = Math.round((rawVal - min) / step);
      const steppedVal = min + stepsCount * step;
      const clampedVal = Math.min(max, Math.max(min, Number(steppedVal.toFixed(2))));
      onChange(clampedVal);
    };

    // Instant update on initial tap/click anywhere on the stick!
    updateFromPosition(e.clientX);
    setIsActive(true);

    const handlePointerMove = (moveEvt) => {
      updateFromPosition(moveEvt.clientX);
    };

    const handlePointerUp = () => {
      setIsActive(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Keyboard navigation support (Arrow keys, Home, End)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, Number((value + step).toFixed(2))));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(min, Number((value - step).toFixed(2))));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className="mb-6 select-none group">
      {/* Label and Value Badge */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          <span>{label}</span>
        </label>
        
        {/* Value readout pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-2xs">
          <span>{value}</span>
          {unit && <span className="font-normal text-emerald-600 dark:text-emerald-400">{unit}</span>}
        </div>
      </div>

      {/* Slider Track Area - 100% tap-adjustable and drag-adjustable */}
      <div 
        ref={trackRef}
        id={id}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center h-8 my-1 cursor-pointer select-none touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
      >
        {/* Progress Stick / Track Bar */}
        <div className="relative w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700/60 overflow-hidden pointer-events-none">
          {/* Active Color Fill */}
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${percentage}%`,
              background: trackBackground
            }}
          />
        </div>

        {/* Draggable Bubble Thumb Knob (Positioned exactly on the progress stick in the middle) */}
        <div
          className={`absolute top-1/2 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2.5 border-emerald-500 shadow-md shadow-emerald-500/25 flex items-center justify-center pointer-events-none transition-transform duration-75 z-10 ${
            isActive 
              ? 'scale-125 ring-4 ring-emerald-500/40 border-emerald-600' 
              : isHovered 
              ? 'scale-110 ring-2 ring-emerald-500/25' 
              : 'ring-1 ring-emerald-500/15'
          }`}
          style={{
            left: thumbLeft,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Inner Bubble Core Pip */}
          <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
        </div>
      </div>

      {/* Min & Max Range Boundary Labels */}
      <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 px-1">
        <span className="font-medium">{min} {unit}</span>
        {helperText && <span className="text-zinc-500 dark:text-zinc-400 font-medium">{helperText}</span>}
        <span className="font-medium">{max} {unit}</span>
      </div>
    </div>
  );
}


