import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TensionWheelProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

const TensionWheel: React.FC<TensionWheelProps> = ({
  value,
  onChange,
  min = 15,
  max = 30,
  step = 0.5,
  label,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const currentValue = parseFloat(value) || min;

  const increment = () => {
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue.toFixed(1));
  };

  const decrement = () => {
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue.toFixed(1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '' || inputValue === '-') {
      onChange(inputValue);
      return;
    }

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(value);

    if (isNaN(numValue) || value === '' || value === '-') {
      onChange(min.toFixed(1));
      return;
    }

    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue.toFixed(1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="decimal"
            className={`w-full p-4 pr-16 border-2 text-center text-2xl font-bold transition-colors ${
              isFocused
                ? 'border-orange-600 ring-2 ring-orange-200'
                : 'border-gray-300 hover:border-orange-500'
            }`}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600">
            kg
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={increment}
            disabled={currentValue >= max}
            className={`p-2 border-2 transition-all ${
              currentValue >= max
                ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 bg-white hover:bg-orange-500 hover:border-orange-600 hover:text-white text-gray-700'
            }`}
            aria-label="Augmenter la tension"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={currentValue <= min}
            className={`p-2 border-2 transition-all ${
              currentValue <= min
                ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 bg-white hover:bg-orange-500 hover:border-orange-600 hover:text-white text-gray-700'
            }`}
            aria-label="Diminuer la tension"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
        <span>Min: {min}kg</span>
        <span>Max: {max}kg</span>
      </div>
    </div>
  );
};

export default TensionWheel;
