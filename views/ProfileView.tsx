import React, { useEffect, useState } from 'react';
import { Member, Reservation } from '../types';
import { api } from '../services/api';

interface Props {
  member: Member | null;
  onLogin: (phone: string, name: string) => void;
}

const ProfileView: React.FC<Props> = ({ member, onLogin }) => {
  const [inputPhone, setInputPhone] = React.useState('');
  const [inputName, setInputName] = React.useState('');
  const [myBookings, setMyBookings] = useState<Reservation[]>([]);
  const [showBookings, setShowBookings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && showBookings) {
      fetchBookings();
    }
  }, [showBookings, member]);

  const fetchBookings = async () => {
    if (!member) return;
    setLoading(true);
    const res = await api.getMemberReservations(member.phone);
    if (res.success && res.data) {
      setMyBookings(res.data);
    }
    setLoading(false);
  };

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">會員登入</h2>
        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">姓名</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-primary"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              placeholder="您的姓名"
            />
          </div>
          <div>
             <label className="text-sm font-medium text-gray-600">手機號碼</label>
            <input 
              type="tel" 
              className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-primary"
              value={inputPhone}
              onChange={e => setInputPhone(e.target.value)}
              placeholder="09xxxxxxxx"
            />
          </div>
          <button 
            onClick={() => onLogin(inputPhone, inputName)}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md hover:bg-secondary mt-4"
          >
            登入 / 註冊
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary pt-10 pb-20 px-6 rounded-b-[3rem] text-white text-center shadow-lg relative">
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-orange-300 flex items-center justify-center text-primary text-3xl font-bold">
           {member.name[0]}
        </div>
        <h2 className="text-2xl font-bold">{member.name}</h2>
        <p className="opacity-90">{member.phone}</p>
        
        <div className="absolute -bottom-10 left-6 right-6 bg-white text-gray-800 p-4 rounded-xl shadow-md flex justify-between items-center">
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="text-xs text-gray-500">現有積分</p>
            <p className="text-2xl font-bold text-primary">{member.points}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">會員等級</p>
            <p className="text-xl font-bold text-gray-700">金牌會員</p>
          </div>
        </div>
      </div>

      <div className="mt-16 px-4 space-y-3">
        {/* Toggle My Bookings */}
        <button 
          onClick={() => setShowBookings(!showBookings)}
          className="w-full bg-white p-4 rounded-xl shadow-sm flex flex-col transition-all"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-semibold text-gray-700">我的訂位紀錄</span>
            <span className={`text-gray-400 text-2xl transition-transform ${showBookings ? 'rotate-90' : ''}`}>›</span>
          </div>
          
          {showBookings && (
            <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-4">
              {loading ? (
                <div className="text-center py-4 text-gray-400">載入中...</div>
              ) : myBookings.length > 0 ? (
                myBookings.map((booking, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-primary text-lg">{new Date(booking.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${booking.status === 'Confirmed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{booking.status}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                       <p>時間: {booking.time} ({booking.pax}人)</p>
                       <p>訂位代號: <span className="font-mono text-gray-800">{booking.id}</span></p>
                       {booking.tableId && <p>桌號: {booking.tableId}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400 text-sm">查無訂位紀錄</div>
              )}
            </div>
          )}
        </button>

         <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <span className="font-semibold text-gray-700">優惠券夾</span>
          <span className="text-gray-400 text-2xl">›</span>
        </button>
         <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between text-left">
          <span className="font-semibold text-gray-700">編輯個人資料</span>
          <span className="text-gray-400 text-2xl">›</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileView;