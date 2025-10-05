import React from 'react';
import { Laptop, SortKey, SortDirection } from '../types';
import { SellIcon, TrashIcon, SortIndicatorIcon } from './icons';

interface LaptopTableProps {
  laptops: Laptop[];
  onSell: (laptop: Laptop) => void;
  onDelete: (id: string) => void;
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

const LaptopTable: React.FC<LaptopTableProps> = ({ laptops, onSell, onDelete, onSort, sortKey, sortDirection }) => {

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  }

  const SortableHeader: React.FC<{ label: string; columnKey: SortKey; className?: string }> = ({ label, columnKey, className = '' }) => {
    const isSorted = sortKey === columnKey;
    const textAlignment = className.includes('text-right') ? 'text-right' : className.includes('text-center') ? 'text-center' : 'text-left';

    return (
        <th scope="col" className={`px-6 py-3 ${textAlignment} text-xs font-medium text-slate-600 uppercase tracking-wider`}>
            <button onClick={() => onSort(columnKey)} className="group inline-flex items-center">
                {label}
                <SortIndicatorIcon direction={isSorted ? sortDirection : 'none'} />
            </button>
        </th>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/30">
        <thead className="bg-slate-50/80">
          <tr>
            <SortableHeader label="Status" columnKey="isSold" />
            <SortableHeader label="Model" columnKey="model" />
            <SortableHeader label="Location" columnKey="location" />
            <SortableHeader label="Supplier" columnKey="supplier" />
            <SortableHeader label="Purchase Price" columnKey="purchasePrice" className="text-right" />
            <SortableHeader label="Purchase Date" columnKey="purchaseDate" />
            <SortableHeader label="Client" columnKey="client" />
            <SortableHeader label="Sale Price" columnKey="salePrice" className="text-right" />
            <SortableHeader label="Sale Date" columnKey="saleDate" />
            <SortableHeader label="My Profit (60%)" columnKey="profit" className="text-right" />
            <SortableHeader label="My Margin (%)" columnKey="profitPercentage" className="text-right" />
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {laptops.length === 0 ? (
             <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-slate-600">
                    No laptops in inventory. Click "Add Laptop" to get started.
                </td>
            </tr>
          ) : (
            laptops.map((laptop) => (
              <tr key={laptop.id} className="hover:bg-sky-100/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {laptop.isSold ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sold</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{laptop.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{laptop.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{laptop.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{laptop.purchasePrice.toFixed(2)} DZD</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(laptop.purchaseDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{laptop.client || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{laptop.salePrice ? `${laptop.salePrice.toFixed(2)} DZD` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(laptop.saleDate || '')}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${laptop.profit && laptop.profit > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {laptop.profit ? `${laptop.profit.toFixed(2)}` : 'N/A'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${laptop.profitPercentage && laptop.profitPercentage > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {laptop.profitPercentage ? `${laptop.profitPercentage.toFixed(2)}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center space-x-3">
                    {!laptop.isSold && (
                      <button onClick={() => onSell(laptop)} className="text-green-600 hover:text-green-900 transition-colors" title="Mark as Sold">
                        <SellIcon />
                      </button>
                    )}
                    <button onClick={() => onDelete(laptop.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Entry">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LaptopTable;