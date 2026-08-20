import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * DraggableResizable - A lightweight, touch-friendly, workspace-bounded
 * container for floating widgets like the Timer Circle and Quotes Widget.
 * Widgets are movable but NOT resizable to maintain intentional sizes.
 */
export const DraggableResizable = ({
  children,
  storageKey,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = 320,
  className = ''
}) => {
  // Load saved position from localStorage
  const [position, setPosition] = useState(() => {
    if (!storageKey) return defaultPosition;
    try {
      const saved = localStorage.getItem(`evolve_pos_${storageKey}`);
      return saved ? JSON.parse(saved) : defaultPosition;
    } catch {
      return defaultPosition;
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

  // Keep strictly within workspace container boundaries
  const clampPosition = useCallback((x, y) => {
    const marginX = 24;
    const marginY = 80;
    const elementWidth = dragRef.current?.offsetWidth || defaultSize;
    const elementHeight = dragRef.current?.offsetHeight || defaultSize;

    const maxX = window.innerWidth - elementWidth - marginX;
    const maxY = window.innerHeight - elementHeight - marginY;

    return {
      x: Math.max(marginX, Math.min(x, Math.max(marginX, maxX))),
      y: Math.max(marginY, Math.min(y, Math.max(marginY, maxY)))
    };
  }, [defaultSize]);

  // Drag handlers (Mouse & Touch)
  const handleStart = (clientX, clientY, target) => {
    // Exclude interactive elements from triggering drag
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
    if (e.button !== 0) return; // Only left click
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
  }, [isDragging, clampPosition]);

  // Handle window resize to clamp positions
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  const style = position.x !== 0 || position.y !== 0
    ? {
        // Widgets are mounted only inside the Focus workspace and are positioned
        // against its relative canvas, never the application viewport.
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${defaultSize}px`,
        zIndex: isDragging ? 50 : 40,
        touchAction: 'none'
      }
    : {
        width: `${defaultSize}px`,
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
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800/90 border border-neutral-700 text-neutral-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-md pointer-events-none z-10 flex items-center gap-1 backdrop-blur-md">
        <span>⋮⋮</span>
        <span>Drag Widget</span>
      </div>

      {/* Main widget content */}
      {typeof children === 'function' ? children({ isDragging }) : children}
    </div>
  );
};
