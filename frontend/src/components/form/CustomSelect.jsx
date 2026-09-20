import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  helperText,
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => (opt.value !== undefined ? opt.value === value : opt === value));
  const displayLabel = selectedOption ? (selectedOption.label || selectedOption) : value || 'Select option';

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        const picked = options[highlightedIndex];
        onChange(picked.value !== undefined ? picked.value : picked);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative mb-5" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          {label}
        </label>
      )}

      {/* Button trigger */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl text-left text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-between hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Helper text */}
      {helperText && (
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
      )}

      {/* Options List */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1 text-sm focus:outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((opt, index) => {
            const optVal = opt.value !== undefined ? opt.value : opt;
            const optLabel = opt.label !== undefined ? opt.label : opt;
            const isSelected = optVal === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={optVal}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : isHighlighted
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="truncate">{optLabel}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
