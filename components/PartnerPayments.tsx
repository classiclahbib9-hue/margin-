import React, { useState, FormEvent, useMemo } from 'react';
import { PartnerPayment } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface PartnerPaymentsProps {
  payments: PartnerPayment[];
  onAddPayment: (payment: Omit<PartnerPayment, 'id'>) => void;
  onDeletePayment: (id: string) => void;
}

const PartnerPayments: React.FC<PartnerPaymentsProps> = ({ payments, onAddPayment, onDeletePayment }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'cash' | 'baridi-mob'>('cash');
  const [filterType, setFilterType] = useState<'all' | 'cash' | 'baridi-mob'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'this-month' | 'last-month' | 'this-year'>('all');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0 || !date) {
      alert('Please enter a valid amount and date.');
      return;
    }
    onAddPayment({ amount: paymentAmount, date, paymentType });
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentType('cash');
  };

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments.filter(payment => {
        const typeMatch = filterType === 'all' || payment.paymentType === filterType;

        if (!typeMatch) return false;

        if (filterDate === 'all') {
            return true;
        }
        
        const paymentDate = new Date(payment.date);
        const paymentMonth = paymentDate.getMonth();
        const paymentYear = paymentDate.getFullYear();

        if (filterDate === 'this-month') {
            return paymentYear === currentYear && paymentMonth === currentMonth;
        }

        if (filterDate === 'this-year') {
            return paymentYear === currentYear;
        }

        if (filterDate === 'last-month') {
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return paymentYear === lastMonthYear && paymentMonth === lastMonth;
        }
        
        return true;
    });
  }, [payments, filterType, filterDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/30">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Partner Payments</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label htmlFor="payment-date-filter" className="sr-only">Filter by date</label>
              <select
                  id="payment-date-filter"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base bg-slate-700 text-white font-bold border-transparent rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm transition-colors cursor-pointer"
              >
                  <option className="text-black bg-white font-normal" value="all">All Dates</option>
                  <option className="text-black bg-white font-normal" value="this-month">This Month</option>
                  <option className="text-black bg-white font-normal" value="last-month">Last Month</option>
                  <option className="text-black bg-white font-normal" value="this-year">This Year</option>
              </select>
            </div>
            <div>
              <label htmlFor="payment-type-filter" className="sr-only">Filter by payment type</label>
              <select
                  id="payment-type-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base bg-slate-700 text-white font-bold border-transparent rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm transition-colors cursor-pointer"
              >
                  <option className="text-black bg-white font-normal" value="all">All Types</option>
                  <option className="text-black bg-white font-normal" value="cash">Cash</option>
                  <option className="text-black bg-white font-normal" value="baridi-mob">Baridi Mob</option>
              </select>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700">Payment Amount (DZD)</label>
            <input
              type="number"
              id="payment-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="e.g., 5000.00"
              required
            />
          </div>
          <div>
            <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
              type="date"
              id="payment-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
          </div>
           <div>
            <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700">Payment Type</label>
            <select
              id="payment-type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as 'cash' | 'baridi-mob')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              required
            >
              <option value="cash">Cash</option>
              <option value="baridi-mob">Baridi Mob</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:scale-105"
          >
            <PlusIcon />
            Record Payment
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/30">
          <thead className="bg-slate-50/80">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Payment Type</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Amount (DZD)</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-600">
                  No payments match the current filters.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-sky-100/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(payment.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{payment.paymentType.replace('-', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium text-right">{payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => onDeletePayment(payment.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Payment">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerPayments;