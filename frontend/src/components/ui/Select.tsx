"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent, FocusEvent } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { classNames } from "@/utils/helpers";
import { SKILLS_LIST } from "@/utils/constants";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options?: Option[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  maxSelections?: number;
  searchable?: boolean;
  allowCustom?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Select({
  label,
  value,
  onChange,
  options = SKILLS_LIST.map(s => ({ value: s, label: s })),
  placeholder = "Select...",
  error,
  helperText,
  maxSelections = 10,
  searchable = true,
  allowCustom = true,
  disabled = false,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) && !value.includes(opt.value)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) return;
    if (value.length >= maxSelections) return;
    onChange([...value, optionValue]);
    setSearchQuery("");
    setFocusedIndex(-1);
    if (!isOpen) inputRef.current?.focus();
  };

  const handleRemove = (valueToRemove: string) => {
    onChange(value.filter(v => v !== valueToRemove));
  };

  const handleCustomAdd = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value.trim();
    if (!val) return;
    
    if (value.includes(val)) {
      setSearchQuery("");
      return;
    }
    
    if (value.length >= maxSelections) return;
    
    const exists = options.some(opt => opt.value.toLowerCase() === val.toLowerCase());
    if (!exists && allowCustom) {
      onChange([...value, val]);
    } else if (exists) {
      const opt = options.find(o => o.value.toLowerCase() === val.toLowerCase());
      if (opt) handleSelect(opt.value);
    }
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else if (searchQuery.trim() && allowCustom) {
          handleCustomAdd({ currentTarget: { value: searchQuery } } as any);
        }
        break;
      case "Backspace":
        if (!searchQuery && value.length > 0) {
          handleRemove(value[value.length - 1]);
        }
        break;
    }
  };

  const handleFocus = () => {
    if (searchable) setIsOpen(true);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    // Delay to allow click on options
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
      }
    }, 100);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={classNames(
          "relative",
          "bg-white rounded-lg border transition-all duration-200",
          error ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500" : 
          isOpen ? "border-primary-500 ring-2 ring-primary-500/20" : "border-slate-300 hover:border-slate-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {/* Selected tags */}
        <div className="flex flex-wrap gap-2 p-2 min-h-[44px]">
          {value.map((val, index) => (
            <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              {val}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(val); }}
                className="p-0.5 rounded-full hover:bg-primary-200 transition-colors"
                aria-label={`Remove ${val}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {/* Search input */}
          {searchable && (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
                setFocusedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onBlur={(e) => handleBlur(e as any)}
              placeholder={value.length === 0 && !isOpen ? placeholder : ""}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 py-1"
              disabled={disabled || value.length >= maxSelections}
              aria-autocomplete="list"
              aria-controls={isOpen ? `${id}-listbox` : undefined}
              aria-expanded={isOpen}
            />
          )}
        </div>

        {/* Chevron */}
        {!searchable && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className={classNames("w-5 h-5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
          </div>
        )}

        {/* Dropdown */}
        {isOpen && searchable && (
          <div 
            id={`${id}-listbox`}
            className="absolute z-10 w-full max-h-60 overflow-y-auto mt-1 bg-white rounded-lg border border-slate-200 shadow-lg"
            role="listbox"
            aria-multiselectable="false"
          >
            {filteredOptions.length === 0 && allowCustom && searchQuery ? (
              <div 
                className="px-4 py-3 text-sm text-primary-600 hover:bg-slate-50 cursor-pointer"
                role="option"
                onClick={() => handleCustomAdd({ currentTarget: { value: searchQuery } } as any)}
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border rounded flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                  Add "{searchQuery}" as new skill
                </span>
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={classNames(
                    "px-4 py-3 text-sm hover:bg-slate-50 cursor-pointer flex items-center gap-3",
                    index === focusedIndex && "bg-primary-50 text-primary-700"
                  )}
                  role="option"
                  aria-selected={index === focusedIndex}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {index === focusedIndex && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                  <span>{option.label}</span>
                </div>
              ))
            )}

            {filteredOptions.length === 0 && !searchQuery && (
              <div className="px-4 py-3 text-sm text-slate-500">No skills match your search</div>
            )}
            {filteredOptions.length === 0 && searchQuery && !allowCustom && (
              <div className="px-4 py-3 text-sm text-slate-500">No matching skills found</div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>}
    </div>
  );
}