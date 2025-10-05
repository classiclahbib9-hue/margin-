import React, { useState, useEffect, FormEvent } from 'react';

interface AddLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { model: string, location: 'center' | 'sud', supplier: string; purchaseDate: string; purchasePrice: number }) => void;
}

const AddLaptopModal: React.FC<AddLaptopModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [model, setModel] = useState('');
  const [location, setLocation] = useState<'center' | 'sud' | ''>('');
  const [supplier, setSupplier] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setModel('');
      setLocation('');
      setSupplier('');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const price = parseFloat(purchasePrice);
    if (!model || !location || !supplier || isNaN(price) || price <= 0 || !purchaseDate) {
      alert('Please fill out all fields correctly.');
      return;
    }
    onAdd({ model, location, supplier, purchasePrice: price, purchaseDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity" onClick={onClose}>
      <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/30 w-full max-w-md m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Laptop</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Laptop Model</label>
                <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Selling Point</label>
                <select 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value as 'center' | 'sud')} 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" 
                  required
                >
                  <option value="" disabled>Select a location</option>
                  <option value="center">Center</option>
                  <option value="sud">Sud</option>
                </select>
              </div>
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier (Fournisseur)</label>
                <input type="text" id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">Purchase Price (DZD)</label>
                <input type="number" id="purchasePrice" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input type="date" id="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </div>
            </div>
          </div>
          <div className="bg-white/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-transparent border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Add Laptop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLaptopModal;