import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Reservation, PosStat } from '../types';

const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<PosStat[]>([]);
  const [activeTab, setActiveTab] = useState<'reservations' | 'stats'>('reservations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [resData, statData] = await Promise.all([
        api.getReservations(),
        api.getStats()
      ]);

      if (resData.success) {
        // Map raw sheet data to Reservation type
        const raw = resData.data || [];
        // Assuming column order from GAS: ID, Name, Phone, Date, Time, Pax, Items, Status, TableID
        // You might need to adjust mapping based on actual sheet headers if different
        setReservations(raw); 
      }
      
      if (statData.success) {
         setStats(statData.data || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    await api.updateReservationStatus(id, newStatus);
  };

  if (loading) return <div className="p-8 text-center">載入後台資料中...</div>;

  return (
    <div className="pb-24 min-h-screen bg-gray-100">
      <div className="bg-gray-800 text-white p-4 sticky top-0 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>👨‍💼</span> 管理員後台
        </h2>
      </div>

      <div className="flex p-2 bg-white shadow-sm mb-4">
        <button 
          className={`flex-1 py-2 text-center font-bold border-b-2 ${activeTab === 'reservations' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('reservations')}
        >
          訂位管理
        </button>
        <button 
           className={`flex-1 py-2 text-center font-bold border-b-2 ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
           onClick={() => setActiveTab('stats')}
        >
          營收統計
        </button>
      </div>

      {activeTab === 'reservations' && (
        <div className="p-2 space-y-3">
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
             <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">今日訂位: {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}</div>
             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">待確認: {reservations.filter(r => r.status === 'Pending').length}</div>
          </div>
          
          {reservations.map((res, idx) => (
            <div key={res.id || idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-primary">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{res.name} <span className="text-sm font-normal text-gray-500">({res.pax}人)</span></h3>
                  <p className="text-sm text-gray-600">{new Date(res.date).toLocaleDateString()} {res.time}</p>
                  <p className="text-xs text-gray-400">{res.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    res.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                    res.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {res.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">桌號: {res.tableId}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => handleStatusChange(res.id!, 'Confirmed')} className="flex-1 bg-green-500 text-white text-xs py-2 rounded">確認</button>
                <button onClick={() => handleStatusChange(res.id!, 'Cancelled')} className="flex-1 bg-red-500 text-white text-xs py-2 rounded">取消</button>
                <button onClick={() => handleStatusChange(res.id!, 'Completed')} className="flex-1 bg-gray-500 text-white text-xs py-2 rounded">完成</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="p-4 bg-white m-4 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 text-gray-700">每日營收趨勢 (POS)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#F97316" name="營收" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-gray-700">來客數統計</h3>
             <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="visitors" fill="#3B82F6" name="人數" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;