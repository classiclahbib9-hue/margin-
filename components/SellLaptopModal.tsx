import React, { useState, useEffect, FormEvent } from 'react';
import { Laptop } from '../types';

interface SellLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSell: (data: { salePrice: number; client: string; saleDate: string }) => void;
  laptop: Laptop;
}

const SellLaptopModal: React.FC<SellLaptopModalProps> = ({ isOpen, onClose, onSell, laptop }) => {
  const [salePrice, setSalePrice] = useState('');
  const [client, setClient] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) {
      setSalePrice('');
      setClient('');
      setSaleDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const price = parseFloat(salePrice);
    if (!client || isNaN(price) || price <= 0 || !saleDate) {
      alert('Please fill out all fields correctly.');
      return;
    }
    onSell({ salePrice: price, client, saleDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" onClick={onClose}>
      <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/30 w-full max-w-md m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sell Laptop</h3>
            <p className="text-sm text-gray-600 mb-4">Model: <span className="font-medium">{laptop.model}</span> | Purchase Price: <span className="font-medium">{laptop.purchasePrice.toFixed(2)} DZD</span></p>
            <div className="space-y-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client</label>
                <input type="text" id="client" value={client} onChange={(e) => setClient(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">Sale Price (DZD)</label>
                <input type="number" id="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">Sale Date</label>
                <input type="date" id="saleDate" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required />
              </div>
            </div>
          </div>
          <div className="bg-white/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Confirm Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellLaptopModal;