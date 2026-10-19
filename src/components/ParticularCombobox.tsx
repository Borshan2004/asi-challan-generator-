'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ParticularComboboxProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
}

export default function ParticularCombobox({
  value,
  onChange,
  suggestions,
  placeholder = 'Select or type particular...',
  disabled = false,
}: ParticularComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = query.trim() === ''
    ? suggestions
    : suggestions.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item: string) => {
    setQuery(item);
    onChange(item);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
        <button
          type="button"
          disabled={disabled}
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 text-slate-400 hover:text-slate-600 p-1"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && !disabled && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto bg-white border border-slate-200 rounded-md shadow-lg py-1 text-xs sm:text-sm">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-slate-700 hover:text-blue-700"
              >
                <span>{item}</span>
                {query.toLowerCase() === item.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                )}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-slate-400 italic">
              Custom particular (press tab to keep): &quot;{query}&quot;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
