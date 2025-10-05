import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Laptop, PartnerPayment, SortKey, SortDirection } from './types';
import SummaryCard from './components/SummaryCard';
import LaptopTable from './components/LaptopTable';
import AddLaptopModal from './components/AddLaptopModal';
import SellLaptopModal from './components/SellLaptopModal';
import PartnerPayments from './components/PartnerPayments';
import ProfitabilityChart from './components/ProfitabilityChart';
import PinCodeModal from './components/PinCodeModal';
import { PlusIcon, CurrencyDollarIcon, CubeIcon, ChartBarIcon, ScaleIcon, UsersIcon, CashIcon, ExportIcon, TrashIcon } from './components/icons';

const App: React.FC = () => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [partnerPayments, setPartnerPayments] = useState<PartnerPayment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<Laptop | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'sold' | 'in-stock'>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<'all' | 'center' | 'sud'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('descending');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('lahbib-laptops-data');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data && Array.isArray(data.laptops) && Array.isArray(data.partnerPayments)) {
          setLaptops(data.laptops);
          setPartnerPayments(data.partnerPayments);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const appData = { laptops, partnerPayments };
      localStorage.setItem('lahbib-laptops-data', JSON.stringify(appData));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [laptops, partnerPayments]);


  const summaryStats = useMemo(() => {
    const totalInvested = laptops.reduce((acc, laptop) => acc + laptop.purchasePrice, 0);
    const unsoldLaptops = laptops.filter(laptop => !laptop.isSold);
    const valueOfUnsold = unsoldLaptops.reduce((acc, laptop) => acc + laptop.purchasePrice, 0);
    const soldLaptops = laptops.filter(laptop => laptop.isSold);
    const totalProfit = soldLaptops.reduce((acc, laptop) => acc + (laptop.profit || 0), 0);
    
    // Recalculating my total purchase cost for sold items to get an accurate margin
    const totalPurchaseForMyProfitCalc = soldLaptops.reduce((acc, laptop) => {
        // Find the total profit before my cut to get the original purchase price contribution
        if (laptop.profit && laptop.partnerShare) {
            const myProfit = laptop.profit;
            const partnerShare = laptop.partnerShare;
            const totalProfit = myProfit + partnerShare;
            if (totalProfit > 0) {
                 return acc + laptop.purchasePrice;
            }
        }
        return acc;
    }, 0);


    const averageProfitPercentage = totalPurchaseForMyProfitCalc > 0 
      ? (totalProfit / totalPurchaseForMyProfitCalc) * 100 
      : 0;

    const totalPartnerShare = soldLaptops.reduce((acc, laptop) => acc + (laptop.partnerShare || 0), 0);
    const totalPaidToPartner = partnerPayments.reduce((acc, payment) => acc + payment.amount, 0);
    const balanceOwedToPartner = totalPartnerShare - totalPaidToPartner;

    return {
      totalInvested,
      valueOfUnsold,
      totalProfit,
      averageProfitPercentage,
      totalPartnerShare,
      balanceOwedToPartner
    };
  }, [laptops, partnerPayments]);

  const uniqueModels = useMemo(() => {
    const models = new Set(laptops.map(laptop => laptop.model));
    return Array.from(models);
  }, [laptops]);

  const filteredLaptops = useMemo(() => {
    return laptops.filter(laptop => {
      const statusMatch = filterStatus === 'all' || (filterStatus === 'sold' && laptop.isSold) || (filterStatus === 'in-stock' && !laptop.isSold);
      const modelMatch = filterModel === 'all' || laptop.model === filterModel;
      const locationMatch = filterLocation === 'all' || laptop.location === filterLocation;
      return statusMatch && modelMatch && locationMatch;
    });
  }, [laptops, filterStatus, filterModel, filterLocation]);
  
  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortKey(key);
      setSortDirection('ascending');
    }
  }, [sortKey]);

  const sortedLaptops = useMemo(() => {
    const sortableLaptops = [...filteredLaptops];
    sortableLaptops.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA == null) return 1;
        if (valB == null) return -1;
        
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return valA === valB ? 0 : valA ? -1 : 1;
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return valA - valB;
        }

        if (sortKey === 'purchaseDate' || sortKey === 'saleDate') {
            const dateA = new Date(valA as string).getTime();
            const dateB = new Date(valB as string).getTime();
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateA - dateB;
        }
        
        return String(valA).localeCompare(String(valB));
    });

    if (sortDirection === 'descending') {
        sortableLaptops.reverse();
    }

    return sortableLaptops;
  }, [filteredLaptops, sortKey, sortDirection]);

  const profitabilityData = useMemo(() => {
    const soldLaptops = laptops.filter(laptop => laptop.isSold && laptop.saleDate && laptop.profit != null);

    if (soldLaptops.length < 2) { // Need at least 2 data points for a meaningful line chart
        return [];
    }

    const monthlyData: { [key: string]: { totalProfit: number; margins: number[] } } = {};

    soldLaptops.forEach(laptop => {
        const saleDate = new Date(laptop.saleDate!);
        const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { totalProfit: 0, margins: [] };
        }

        monthlyData[monthKey].totalProfit += laptop.profit!;
        if (laptop.profitPercentage != null) {
            monthlyData[monthKey].margins.push(laptop.profitPercentage);
        }
    });

    const chartData = Object.keys(monthlyData).map(monthKey => {
        const data = monthlyData[monthKey];
        const avgMargin = data.margins.length > 0 ? data.margins.reduce((a, b) => a + b, 0) / data.margins.length : 0;
        
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const name = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        return {
            name,
            totalProfit: parseFloat(data.totalProfit.toFixed(2)),
            avgMargin: parseFloat(avgMargin.toFixed(2)),
            sortKey: monthKey,
        };
    });

    return chartData.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [laptops]);


  const handleAddLaptop = useCallback((newLaptopData: Omit<Laptop, 'id' | 'isSold'>) => {
    const newLaptop: Laptop = {
      ...newLaptopData,
      id: new Date().getTime().toString(),
      isSold: false,
    };
    setLaptops(prevLaptops => [newLaptop, ...prevLaptops]);
  }, []);

  const handleSellLaptop = useCallback((sellData: { salePrice: number; client: string; saleDate: string; }) => {
    if (!selectedLaptop) return;

    setLaptops(prevLaptops =>
      prevLaptops.map(laptop => {
        if (laptop.id === selectedLaptop.id) {
          const totalProfit = sellData.salePrice - laptop.purchasePrice;
          const myProfit = totalProfit * 0.60;
          const partnerShare = totalProfit * 0.40;
          const profitPercentage = laptop.purchasePrice > 0 ? (myProfit / laptop.purchasePrice) * 100 : 0;
          
          return {
            ...laptop,
            isSold: true,
            salePrice: sellData.salePrice,
            client: sellData.client,
            saleDate: sellData.saleDate,
            profit: myProfit,
            profitPercentage,
            partnerShare,
          };
        }
        return laptop;
      })
    );
    setSelectedLaptop(null);
  }, [selectedLaptop]);

  const handleDeleteLaptop = useCallback((id: string) => {
    if(window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        setLaptops(prevLaptops => prevLaptops.filter(laptop => laptop.id !== id));
    }
  }, []);
  
  const handleAddPartnerPayment = useCallback((payment: Omit<PartnerPayment, 'id'>) => {
    const newPayment: PartnerPayment = {
      ...payment,
      id: new Date().getTime().toString()
    };
    setPartnerPayments(prev => [...prev, newPayment].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleDeletePartnerPayment = useCallback((id: string) => {
    if(window.confirm('Are you sure you want to delete this payment?')) {
      setPartnerPayments(prev => prev.filter(p => p.id !== id));
    }
  }, []);


  const openSellModal = useCallback((laptop: Laptop) => {
    setSelectedLaptop(laptop);
    setIsSellModalOpen(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (sortedLaptops.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = [
        "Status", "Model", "Location", "Supplier", "Purchase Date", "Purchase Price (DZD)",
        "Client", "Sale Date", "Sale Price (DZD)", "My Profit (60%) (DZD)", "My Margin (%)", "Partner Share (DZD)"
    ];

    const escapeCsvCell = (cellData: any) => {
        const stringData = String(cellData ?? '');
        if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
            return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
    };

    const csvRows = [headers.join(',')];

    sortedLaptops.forEach(laptop => {
        const row = [
            laptop.isSold ? "Sold" : "In Stock",
            escapeCsvCell(laptop.model),
            escapeCsvCell(laptop.location),
            escapeCsvCell(laptop.supplier),
            laptop.purchaseDate,
            laptop.purchasePrice.toFixed(2),
            laptop.client ? escapeCsvCell(laptop.client) : "",
            laptop.saleDate || "",
            laptop.salePrice ? laptop.salePrice.toFixed(2) : "",
            laptop.profit ? laptop.profit.toFixed(2) : "",
            laptop.profitPercentage ? laptop.profitPercentage.toFixed(2) : "",
            laptop.partnerShare ? laptop.partnerShare.toFixed(2) : ""
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `lahbib_laptop_inventory_report_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  }, [sortedLaptops]);

  const handleClearAllDataRequest = () => {
    setIsPinModalOpen(true);
  };

  const handleConfirmClearAllData = (pin: string) => {
    if (pin === 'a9it') {
      localStorage.removeItem('lahbib-laptops-data');
      setLaptops([]);
      setPartnerPayments([]);
      alert("All data has been cleared successfully.");
    } else {
      alert("Incorrect PIN. Data was not cleared.");
    }
    setIsPinModalOpen(false);
  };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Lahbib's Laptop Inventory Tracker</h1>
          <p className="text-slate-700 mt-2 text-lg">Your dashboard for managing laptop purchases, sales, and profits.</p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard 
              title="Total Invested" 
              value={`${summaryStats.totalInvested.toFixed(2)} DZD`} 
              icon={<ScaleIcon />} 
              color="blue"
            />
            <SummaryCard 
              title="Value of Unsold Stock" 
              value={`${summaryStats.valueOfUnsold.toFixed(2)} DZD`} 
              icon={<CubeIcon />} 
              color="orange"
            />
            <SummaryCard 
              title="My Total Profit (60%)" 
              value={`${summaryStats.totalProfit.toFixed(2)} DZD`} 
              icon={<CurrencyDollarIcon />} 
              color="green"
            />
            <SummaryCard 
              title="My Avg. Profit Margin" 
              value={`${summaryStats.averageProfitPercentage.toFixed(2)}%`} 
              icon={<ChartBarIcon />} 
              color="purple"
            />
            <SummaryCard 
              title="Partner's Total Cut" 
              value={`${summaryStats.totalPartnerShare.toFixed(2)} DZD`} 
              icon={<UsersIcon />} 
              color="teal"
            />
            <SummaryCard 
              title="Balance Owed to Partner" 
              value={`${summaryStats.balanceOwedToPartner.toFixed(2)} DZD`} 
              icon={<CashIcon />} 
              color="pink"
            />
          </div>

          <div className="mb-8">
            <ProfitabilityChart data={profitabilityData} />
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/30 flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-slate-800">Inventory</h2>
              <div className="flex items-center gap-2 flex-wrap">
                 <div>
                    <label htmlFor="location-filter" className="sr-only">Filter by location</label>
                    <select
                        id="location-filter"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value as 'all' | 'center' | 'sud')}
                        className="block w-full pl-3 pr-10 py-2 text-base bg-slate-700 text-white font-bold border-transparent rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors cursor-pointer"
                    >
                        <option className="text-black bg-white font-normal" value="all">All Locations</option>
                        <option className="text-black bg-white font-normal" value="center">Center</option>
                        <option className="text-black bg-white font-normal" value="sud">Sud</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="model-filter" className="sr-only">Filter by model</label>
                    <select
                        id="model-filter"
                        value={filterModel}
                        onChange={(e) => setFilterModel(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base bg-slate-700 text-white font-bold border-transparent rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors cursor-pointer"
                    >
                        <option className="text-black bg-white font-normal" value="all">All Models</option>
                        {uniqueModels.map(model => (
                            <option key={model} value={model} className="text-black bg-white font-normal">{model}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'sold' | 'in-stock')}
                        className="block w-full pl-3 pr-10 py-2 text-base bg-slate-700 text-white font-bold border-transparent rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors cursor-pointer"
                    >
                        <option className="text-black bg-white font-normal" value="all">All Statuses</option>
                        <option className="text-black bg-white font-normal" value="in-stock">In Stock</option>
                        <option className="text-black bg-white font-normal" value="sold">Sold</option>
                    </select>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                  title="Export current view to CSV"
                >
                  <ExportIcon />
                  Export CSV
                </button>
                <button
                  onClick={handleClearAllDataRequest}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Clear all application data"
                >
                  <TrashIcon />
                  Clear All Data
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
                >
                  <PlusIcon />
                  Add Laptop
                </button>
              </div>
            </div>
            
            <LaptopTable 
              laptops={sortedLaptops} 
              onSell={openSellModal} 
              onDelete={handleDeleteLaptop}
              onSort={handleSort}
              sortKey={sortKey}
              sortDirection={sortDirection} 
            />
          </div>

          <div className="mt-8">
            <PartnerPayments 
                payments={partnerPayments} 
                onAddPayment={handleAddPartnerPayment}
                onDeletePayment={handleDeletePartnerPayment}
            />
          </div>
        </main>
      </div>

      <AddLaptopModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLaptop}
      />
      
      {selectedLaptop && (
        <SellLaptopModal
          isOpen={isSellModalOpen}
          onClose={() => {
            setIsSellModalOpen(false);
            setSelectedLaptop(null);
          }}
          onSell={handleSellLaptop}
          laptop={selectedLaptop}
        />
      )}

      <PinCodeModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleConfirmClearAllData}
      />
    </div>
  );
};

export default App;