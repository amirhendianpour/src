import React from 'react';

interface CallOverlayProps {
  isOpen: boolean;
  chatName: string;
  onClose: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ isOpen, chatName, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
      <div className="w-24 h-24 bg-gray-600 rounded-full mb-6 flex items-center justify-center text-3xl shadow-lg border-4 border-gray-500">
        {chatName.charAt(0)}
      </div>
      <h2 className="text-2xl font-bold mb-2">در حال تماس با {chatName}...</h2>
      <p className="text-gray-300 mb-12">00:00</p>
      
      <div className="flex gap-6">
        <button className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center text-xl hover:bg-gray-600 transition">
          🎤
        </button>
        <button 
          onClick={onClose}
          className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
        >
          ☎️
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;