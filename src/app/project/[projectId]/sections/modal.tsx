import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string; // Optional title prop
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center p-4 justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-2 border-b">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
