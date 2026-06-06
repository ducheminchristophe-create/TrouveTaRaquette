'use client'

import React, { useRef, useEffect, useCallback } from 'react';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
  disabled?: boolean;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 5,
  max = 50,
  step = 5,
  value,
  onChange,
  currency = '€',
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<0 | 1 | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const snap = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [min, max, step]
  );

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const clientXToValue = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return snap(min + ratio * (max - min));
    },
    [min, max, snap]
  );

  useEffect(() => {
    const onMove = (clientX: number) => {
      if (dragging.current === null) return;
      const [lo, hi] = valueRef.current;
      const v = clientXToValue(clientX);
      if (dragging.current === 0) onChange([Math.min(v, hi), hi]);
      else onChange([lo, Math.max(v, lo)]);
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
    const onEnd = () => { dragging.current = null; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [clientXToValue, onChange]);

  const startDrag = (index: 0 | 1) => (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    dragging.current = index;
  };

  const handleKeyDown = (index: 0 | 1) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step :
      e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
    if (!delta) return;
    e.preventDefault();
    const [lo, hi] = value;
    if (index === 0) onChange([Math.min(snap(lo + delta), hi), hi]);
    else onChange([lo, Math.max(snap(hi + delta), lo)]);
  };

  const handleInput = (index: 0 | 1) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    const clamped = snap(v);
    if (index === 0) onChange([Math.min(clamped, value[1]), value[1]]);
    else onChange([value[0], Math.max(clamped, value[0])]);
  };

  const leftPct = toPercent(value[0]);
  const rightPct = toPercent(value[1]);

  const thumbClass = (active: boolean) =>
    `absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 bg-white shadow-md transition-shadow
     focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600
     ${active ? 'border-orange-600' : 'border-orange-400'}
     ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing hover:shadow-lg'}`;

  return (
    <div className="w-full max-w-[360px]">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Budget <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </span>
        <span className="text-sm font-semibold text-orange-600 tabular-nums">
          {currency}{value[0]} – {currency}{value[1]}
        </span>
      </div>

      {/* Track */}
      <div className="px-2 py-1">
        <div ref={trackRef} className="relative h-2 bg-gray-200 rounded-full">
          {/* Active fill */}
          <div
            className="absolute h-full bg-orange-500 rounded-full"
            style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
          />

          {/* Min handle */}
          <button
            type="button"
            role="slider"
            aria-label="Prix minimum"
            aria-valuemin={min}
            aria-valuemax={value[1]}
            aria-valuenow={value[0]}
            disabled={disabled}
            className={thumbClass(true)}
            style={{ left: `${leftPct}%`, zIndex: leftPct > 90 ? 4 : 3 }}
            onMouseDown={startDrag(0)}
            onTouchStart={startDrag(0)}
            onKeyDown={handleKeyDown(0)}
          />

          {/* Max handle */}
          <button
            type="button"
            role="slider"
            aria-label="Prix maximum"
            aria-valuemin={value[0]}
            aria-valuemax={max}
            aria-valuenow={value[1]}
            disabled={disabled}
            className={thumbClass(true)}
            style={{ left: `${rightPct}%`, zIndex: 3 }}
            onMouseDown={startDrag(1)}
            onTouchStart={startDrag(1)}
            onKeyDown={handleKeyDown(1)}
          />
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-400 px-2 mt-1 mb-4">
        <span>{currency}{min}</span>
        <span>{currency}{max}</span>
      </div>

      {/* Number inputs */}
      <div className="flex gap-3">
        {(['Min', 'Max'] as const).map((label, i) => (
          <div key={label} className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                {currency}
              </span>
              <input
                type="number"
                min={i === 0 ? min : value[0]}
                max={i === 0 ? value[1] : max}
                step={step}
                value={value[i]}
                disabled={disabled}
                onChange={handleInput(i as 0 | 1)}
                className="w-full pl-6 pr-2 py-2 text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
