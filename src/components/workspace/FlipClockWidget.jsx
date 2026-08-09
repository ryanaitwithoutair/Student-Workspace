import React, { useState, useEffect } from 'react';
import { Clock, X } from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { DraggableResizable } from '../common/DraggableResizable';
import { useWidgetTranslucency } from '../../hooks/useWidgetTranslucency';

export const FlipClockWidget = () => {
  const { toggleFlipClockWidget } = useApp();
  const { widgetBgStyle, cardBgStyle } = useWidgetTranslucency();
  const [time, setTime] = useState(new Date());
  const [is12HourFormat, setIs12HourFormat] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 12-Hour Format Calculations
  const rawHours = time.getHours();
  const period = rawHours >= 12 ? 'PM' : 'AM';
  let displayHoursNum = rawHours;
  if (is12HourFormat) {
    displayHoursNum = rawHours % 12;
    if (displayHoursNum === 0) displayHoursNum = 12;
  }

  const hours = displayHoursNum.toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  // Centered Default Position: Right in the middle of the screen
  const defaultCenterX = Math.max(24, Math.round((window.innerWidth / 2) - 190));
  const defaultCenterY = Math.max(80, Math.round((window.innerHeight / 2) - 95));

  // Translucent 3D Flip Card Component
  const FlipCard = ({ digit, label, isPeriod = false }) => (
    <div className="flex flex-col items-center gap-1 group">
      <div 
        style={cardBgStyle}
        className={`relative border border-emerald-500/30 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20 ${
          isPeriod ? 'w-12 h-16 sm:w-14 sm:h-20 border-emerald-500/40' : 'w-14 h-16 sm:w-16 sm:h-20'
        }`}
      >
        {/* Luminous Top Sheen */}
        <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

        {/* 3D Split Card Center Line */}
        <div className="absolute w-full h-[1.5px] bg-emerald-500/30 top-1/2 left-0 z-10 shadow-[0_0_8px_#10b981]"></div>

        {/* Digit Display */}
        <span 
          key={digit} 
          className={`font-mono font-extrabold text-white tracking-widest animate-fadeIn drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)] ${
            isPeriod ? 'text-lg sm:text-xl text-emerald-400' : 'text-2xl sm:text-3xl'
          }`}
        >
          {digit}
        </span>
      </div>
      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400/80">{label}</span>
    </div>
  );

  return (
    <DraggableResizable
      storageKey="flip_clock_widget_v3"
      defaultSize={380}
      resizable={false}
      defaultPosition={{ x: defaultCenterX, y: defaultCenterY }}
      className="fixed z-40 animate-pop-spring"
    >
      {() => (
        <div 
          style={widgetBgStyle}
          className="rounded-3xl p-5 border border-emerald-500/40 shadow-2xl relative transition-all duration-500 hover:border-emerald-400 space-y-3 shadow-emerald-500/10"
        >
          {/* Cute Luminous Halo */}
          <div className="absolute -top-14 -left-14 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

          {/* Header */}
          <div className="flex items-center justify-between no-drag pb-1.5 border-b border-neutral-800/80">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Clock className="w-4 h-4 animate-bounce text-emerald-400" />
              <span className="text-white">Translucent 12H Flip Clock</span>
            </div>

            <div className="flex items-center gap-2">
              {/* 12H / 24H Format Toggle Button */}
              <button
                onClick={() => setIs12HourFormat(!is12HourFormat)}
                className="px-2.5 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 border border-emerald-500/30 text-[10px] uppercase font-bold text-emerald-400 hover:text-white transition-all backdrop-blur-md"
                title="Toggle 12H / 24H Format"
              >
                {is12HourFormat ? '12-Hour' : '24-Hour'}
              </button>

              {/* Close Button */}
              <button
                onClick={toggleFlipClockWidget}
                className="p-1 rounded-lg bg-neutral-800/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors backdrop-blur-md"
                title="Close Flip Clock"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Translucent Flip Cards Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2 no-drag">
            <FlipCard digit={hours} label="Hours" />
            <span className="text-xl font-bold text-emerald-400 self-center -mt-4 animate-pulse">:</span>
            <FlipCard digit={minutes} label="Mins" />
            <span className="text-xl font-bold text-emerald-400 self-center -mt-4 animate-pulse">:</span>
            <FlipCard digit={seconds} label="Secs" />

            {/* AM / PM Badge Card in 12-Hour Mode */}
            {is12HourFormat && (
              <>
                <span className="w-1"></span>
                <FlipCard digit={period} label="Phase" isPeriod={true} />
              </>
            )}
          </div>
        </div>
      )}
    </DraggableResizable>
  );
};
