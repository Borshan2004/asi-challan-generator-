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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const filtered = !query.trim()
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-2.5 pr-8 py-1.5 text-xs sm:text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-500"
        />
        <button
          type="button"
          disabled={disabled}
          tabIndex={-1}
          onMouseDown={toggleDropdown}
          className="absolute right-0 top-0 bottom-0 px-2 flex items-center text-slate-400 hover:text-slate-700 transition"
          title="Show garment suggestions"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[100] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-300 rounded-md shadow-xl py-1 text-xs sm:text-sm">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span>Suggestions ({filtered.length})</span>
            {query && <span className="text-blue-600 font-normal">Filtering: &quot;{query}&quot;</span>}
          </div>
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur before click finishes
                  handleSelect(item);
                }}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between transition ${
                  query.toLowerCase() === item.toLowerCase()
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-800 hover:bg-blue-50/70 hover:text-blue-600'
                }`}
              >
                <span>{item}</span>
                {query.toLowerCase() === item.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-blue-600 ml-2 flex-shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="px-3 py-2.5 text-xs text-slate-500 italic bg-amber-50/60">
              Custom item entered: <strong className="text-slate-800">&quot;{query}&quot;</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
