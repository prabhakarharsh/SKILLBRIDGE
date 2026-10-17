import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from "react";
import { classNames } from "@/utils/helpers";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block font-display font-black text-xs uppercase tracking-wider text-black mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/60 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={classNames(
              "w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm transition-all focus:outline-none focus:bg-white placeholder:text-black/40",
              leftIcon ? "pl-11" : "",
              rightIcon ? "pr-11" : "",
              error ? "border-red-600 bg-red-50/50" : "border-black",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/60 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 font-mono text-xs font-bold text-red-600" role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 font-mono text-xs text-black/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block font-display font-black text-xs uppercase tracking-wider text-black mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-3.5 text-black/60 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={classNames(
              "w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm transition-all focus:outline-none focus:bg-white placeholder:text-black/40 resize-y min-h-[100px]",
              leftIcon ? "pl-11" : "",
              rightIcon ? "pr-11" : "",
              error ? "border-red-600 bg-red-50/50" : "border-black",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-3.5 text-black/60 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 font-mono text-xs font-bold text-red-600" role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 font-mono text-xs text-black/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => (
    <label ref={ref} className={classNames("block font-display font-black text-xs uppercase tracking-wider text-black mb-1.5", className)} {...props}>
      {children}
    </label>
  )
);

Label.displayName = "Label";