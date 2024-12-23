// components/Modal.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on ESC key press and handle focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Handle focus trapping
      if (e.key === 'Tab') {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Set focus to the modal when it opens and prevent background scrolling
  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Focus the modal
    if (modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
      if (focusableElements.length) {
        focusableElements[0].focus();
      }
    }

    return () => {
      // Restore scrolling
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg w-full max-w-3xl h-5/6 overflow-hidden transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h2 id="modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
