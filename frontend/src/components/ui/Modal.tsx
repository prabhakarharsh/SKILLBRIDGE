"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { classNames } from "@/utils/helpers";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md", 
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true 
}: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEscape) onClose();
  }, [onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={classNames("relative w-full bg-white rounded-3xl border-4 border-black brutal-shadow-lg transform transition-all p-6", sizeClasses[size])}>
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
              {title && <h2 className="font-display font-black text-lg text-black uppercase tracking-tight">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="font-mono font-black text-lg hover:text-red-600 transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              )}
            </div>
          )}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "primary",
  loading = false 
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="space-y-4">
        <p className="font-headline font-semibold text-xs text-black/80 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="brutal-btn px-4 py-2 rounded-xl bg-gray-200 border-2 border-black font-display font-black text-xs uppercase"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={classNames(
              "brutal-btn px-5 py-2.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase",
              variant === "danger" ? "bg-red-500 text-white" : "bg-black text-brutal-yellow"
            )}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}