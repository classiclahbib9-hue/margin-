import React, { useState, useEffect, FormEvent } from 'react';

interface PinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

const PinCodeModal: React.FC<PinCodeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPin(''); // Reset PIN when modal closes
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pin) {
      onConfirm(pin);
    } else {
      alert("Please enter a PIN code.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity" onClick={onClose}>
      <div className="bg-white/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/30 w-full max-w-sm m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter PIN to Clear Data</h3>
            <p className="text-sm text-gray-600 mb-4">This is a destructive action. Please enter your PIN to confirm you want to delete all data permanently.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input
                  type="password"
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>
          <div className="bg-white/60 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Confirm & Clear Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinCodeModal;
