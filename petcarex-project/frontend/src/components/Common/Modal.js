import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;