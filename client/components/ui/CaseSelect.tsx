'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Radar } from 'lucide-react';
import { formatCaseLabel } from '@/lib/formatCaseLabel';

export interface CaseSelectProps {
  cases: Array<{
    case_id: string;
    [key: string]: any;
  }>;
  selectedCaseId: string | null;
  onSelectCaseId: (caseId: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * Custom glassmorphic Case/Event dropdown selector.
 * Completely replaces native OS <select> to prevent browser-native popover artifacts (e.g. white boxes in Windows Chromium),
 * while maintaining clean Title Case formatting, keyboard accessibility, and exact ID state value passing.
 */
export function CaseSelect({
  cases,
  selectedCaseId,
  onSelectCaseId,
  disabled = false,
  className = '',
  id,
}: CaseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectedCase = cases.find((c) => c.case_id === selectedCaseId) || null;
  const displayLabel = selectedCase ? formatCaseLabel(selectedCase) : 'Select Investigation Target';

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keep focused item visible when navigating with arrow keys
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [focusedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || cases.length === 0) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = cases.findIndex((c) => c.case_id === selectedCaseId);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < cases.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : cases.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < cases.length) {
          onSelectCaseId(cases[focusedIndex].case_id);
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (caseId: string) => {
    onSelectCaseId(caseId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        id={selectId}
        type="button"
        disabled={disabled || cases.length === 0}
        onClick={() => {
          if (!disabled && cases.length > 0) {
            setIsOpen((prev) => !prev);
            const currentIndex = cases.findIndex((c) => c.case_id === selectedCaseId);
            setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        className={`w-full bg-[#060b17]/95 border border-sky-500/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-sans font-medium text-slate-100 flex items-center justify-between gap-2 shadow-inner hover:border-sky-400/60 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all cursor-pointer ${
          isOpen ? 'ring-1 ring-sky-400 border-sky-400/60' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate text-left text-slate-100">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 text-sky-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-sky-300' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* CUSTOM FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 min-w-full bg-[#070d1e]/98 backdrop-blur-2xl border border-sky-500/40 rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(56,189,248,0.2)] overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="tech-corner-tl" />
          <div className="tech-corner-tr" />

          <ul
            id={`${selectId}-listbox`}
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined
            }
            className="py-1 max-h-64 overflow-y-auto divide-y divide-sky-500/10 focus:outline-none"
          >
            {cases.map((c, index) => {
              const isSelected = c.case_id === selectedCaseId;
              const isFocused = focusedIndex === index;
              const formatted = formatCaseLabel(c);

              return (
                <li
                  key={c.case_id}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(c.case_id)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-sky-500/25 text-sky-200 font-semibold border-l-2 border-sky-400'
                      : isFocused
                      ? 'bg-sky-500/15 text-white'
                      : 'text-slate-200 hover:bg-sky-500/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{formatted}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Hidden native select to preserve form compatibility & automated accessibility querying */}
      <select
        value={selectedCaseId || ''}
        onChange={(e) => onSelectCaseId(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only pointer-events-none"
      >
        {cases.map((c) => (
          <option key={c.case_id} value={c.case_id}>
            {formatCaseLabel(c)}
          </option>
        ))}
      </select>
    </div>
  );
}
