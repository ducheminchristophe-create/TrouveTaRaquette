import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
  label?: string;
  allowCustom?: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  label,
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (allowCustom) {
      onChange(newValue);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (allowCustom && searchTerm) {
          onChange(searchTerm);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  const displayValue = searchTerm || value;

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full p-4 pr-12 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium ${className}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
        >
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              className={`w-full text-left p-3 hover:bg-orange-50 transition-colors font-medium ${
                index === highlightedIndex ? 'bg-orange-100' : ''
              }`}
              onClick={() => handleSelectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 shadow-lg">
          <div className="p-3 text-gray-500 text-sm">
            {allowCustom ? (
              <span>Appuyez sur Entrée pour utiliser "{searchTerm}"</span>
            ) : (
              <span>Aucun résultat trouvé</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboBox;
