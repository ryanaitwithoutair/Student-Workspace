import React, { useState, useEffect, useRef } from 'react';

/**
 * DraggableResizable - A lightweight, touch-friendly, viewport-constrained
 * container for floating widgets like the Timer Circle and Daily Quote.
 */
export const DraggableResizable = ({
  children,
  storageKey,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = 320,
  minSize = 200,
  maxSize = 520,
  resizable = true,
  className = '',
  title = ''
}) => {
  // Load saved position/size from localStorage
  const [position, setPosition] = useState(() => {
    if (!storageKey) return defaultPosition;
    try {
      const saved = localStorage.getItem(`evolve_pos_${storageKey}`);
      return saved ? JSON.parse(saved) : defaultPosition;
    } catch {
      return defaultPosition;
    }
  });

  const [size, setSize] = useState(() => {
    if (!storageKey) return defaultSize;
    try {
      const saved = localStorage.getItem(`evolve_size_${storageKey}`);
      return saved ? parseInt(saved, 10) : defaultSize;
    } catch {
      return defaultSize;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Save changes to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`evolve_pos_${storageKey}`, JSON.stringify(position));
    }
  }, [position, storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`evolve_size_${storageKey}`, size.toString());
    }
  }, [size, storageKey]);

  // Keep within viewport boundaries
  const clampPosition = (x, y) => {
    const margin = 10;
    const maxX = window.innerWidth - (dragRef.current?.offsetWidth || size) - margin;
    const maxY = window.innerHeight - (dragRef.current?.offsetHeight || size) - margin;
    return {
      x: Math.max(margin, Math.min(x, Math.max(margin, maxX))),
      y: Math.max(margin, Math.min(y, Math.max(margin, maxY)))
    };
  };

  // Drag handlers (Mouse & Touch)
  const handleStart = (clientX, clientY, target) => {
    // Avoid dragging when interacting with form inputs, buttons, sliders, or links
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    handleStart(e.clientX, e.clientY, e.target);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - dragStartRef.current.mouseX;
      const dy = clientY - dragStartRef.current.mouseY;
      const newPos = clampPosition(
        dragStartRef.current.posX + dx,
        dragStartRef.current.posY + dy
      );
      setPosition(newPos);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, size]);

  // Handle window resize to prevent off-screen widgets
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  const style = position.x !== 0 || position.y !== 0
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: resizable ? `${size}px` : 'auto',
        zIndex: isDragging ? 50 : 40,
        touchAction: 'none'
      }
    : {
        width: resizable ? `${size}px` : 'auto',
        position: 'relative'
      };

  return (
    <div
      ref={dragRef}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`group relative rounded-3xl transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-[1.01]' : 'cursor-grab hover:shadow-xl'
      } ${className}`}
    >
      {/* Drag handle header / indicator */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-md pointer-events-none z-10 flex items-center gap-1">
        <span>⋮⋮</span>
        <span>Drag Widget</span>
      </div>

      {/* Main widget content */}
      {typeof children === 'function' ? children({ size, isDragging }) : children}

      {/* Resize Controls */}
      {resizable && (
        <div className="no-drag mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-2 px-4 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-full text-xs">
          <span className="text-[10px] text-neutral-400 font-medium">Size</span>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            step="10"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value, 10))}
            className="w-24 accent-emerald-500 h-1 bg-neutral-700 rounded cursor-pointer"
          />
          <span className="text-[10px] font-mono text-emerald-400">{size}px</span>
        </div>
      )}
    </div>
  );
};
