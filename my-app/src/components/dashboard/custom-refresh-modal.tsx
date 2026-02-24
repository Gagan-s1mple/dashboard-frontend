// custom-refresh-modal.tsx
"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";

interface CustomRefreshModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

export const CustomRefreshModal = ({
  isOpen,
  onCancel,
  onContinue,
}: CustomRefreshModalProps) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center"
        onClick={onCancel}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stop Query Processing?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    A query is currently being processed in the background. If you
                    refresh now, the polling will be interrupted and you may lose the
                    output data.
                  </p>
                  <p>
                    Do you want to continue with the refresh?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <Button
              onClick={onContinue}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Continue - Refresh
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
            >
              Cancel - Keep Processing
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};