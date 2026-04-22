import React, { useState, useRef } from 'react';
import './RangeFilter.css';

const RangeFilter = ({ label, min, max, value, onChange, displayValue, step = 1, onReset }) => {
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const toggleRangeEnabled = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRangeEnabled((prev) => {
      const newValue = !prev;
      // Si se deshabilita y hay una función de reset, resetear el filtro
      if (!newValue && onReset) {
        onReset();
      }
      return newValue;
    });
  };

  // Touch logic for tap detection
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
  };

  const handleTouchMove = () => {
    hasMovedRef.current = true;
  };

  const handleTouchEnd = (e) => {
    if (!hasMovedRef.current) {
      toggleRangeEnabled(e);
    }
    hasMovedRef.current = false;
  };

  // Mouse logic for click detection (not drag)
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      touchStartPosRef.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = false;
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      const deltaX = Math.abs(e.clientX - touchStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - touchStartPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        hasMovedRef.current = true;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (e.button === 0 && !hasMovedRef.current) {
      toggleRangeEnabled(e);
    }
    hasMovedRef.current = false;
  };

  return (
    <div className={`range-group ${!isRangeEnabled ? 'disabled' : ''}`}>
      <div 
        className="range-header"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: 'pointer' }}
      >
        <div className="range-title-wrapper">
          <span>{label}</span>
          <span className={`range-indicator ${isRangeEnabled ? 'enabled' : ''}`}></span>
        </div>
        <span className="range-value">{displayValue || value}</span>
      </div>
      <div className="range-slider-wrapper">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={!isRangeEnabled}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{ opacity: isRangeEnabled ? 1 : 0.4, pointerEvents: isRangeEnabled ? 'auto' : 'none' }}
        />
      </div>
    </div>
  );
};

export default RangeFilter;
