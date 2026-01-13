import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Promotion, AppView, Member } from '../types';
import { MapPin, HelpCircle, Phone, Clock, ShoppingBag } from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
  member: Member | null;
}

const HomeView: React.FC<Props> = ({ setView, member }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const res = await api.getPromotions();
      if (res.success && res.data) {
        setPromotions(res.data);
      }
    };
    loadData();
  }, []);

  const handleReservationClick = () => {
    if (!member) {
      const confirmRegister = window.confirm("非會員無法使用線上訂位功能。\n\n請先註冊或登入會員，是否前往會員中心？");
      if (confirmRegister) {
        setView(AppView.PROFILE);
      }
    } else {
      setView(AppView.RESERVATION);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="relative h-64 bg-gray-900 text-white flex items-end p-6 overflow-hidden">
        <img 
          src="https://picsum.photos/800/600?grayscale" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Restaurant"
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">美味餐廳</h1>
          <p className="text-sm opacity-90">享受美食，品味生活</p>
        </div>
      </div>

      {/* Promotions Carousel */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">最新優惠</h2>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {promotions.length > 0 ? promotions.map((promo, idx) => (
            <div key={idx} className="min-w-[280px] bg-white rounded-xl shadow-md overflow-hidden">
              <img src={promo.image || `https://picsum.photos/300/150?random=${idx}`} className="w-full h-32 object-cover" alt={promo.title} />
              <div className="p-4">
                <h3 className="font-bold text-lg text-primary">{promo.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{promo.content}</p>
                <p className="text-xs text-gray-400 mt-2">有效期至: {new Date(promo.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
             <div className="w-full text-center py-8 text-gray-400">目前沒有活動</div>
          )}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <button onClick={() => setView(AppView.MENU)} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 active:bg-orange-50 transition">
          <UtensilsIcon size={32} className="text-primary" />
          <span className="font-semibold">瀏覽菜單</span>
        </button>
        <button onClick={handleReservationClick} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 active:bg-orange-50 transition">
          <CalendarIcon size={32} className="text-primary" />
          <span className="font-semibold">線上訂位</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-start space-x-4">
          <Clock className="text-gray-400 shrink-0" />
          <div>
            <h3 className="font-semibold">營業時間</h3>
            <p className="text-sm text-gray-600">週二至週日 11:00 - 21:00</p>
            <p className="text-sm text-red-500 font-bold">週一公休</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-start space-x-4" onClick={() => setView(AppView.LOCATION)}>
          <MapPin className="text-gray-400 shrink-0" />
          <div>
            <h3 className="font-semibold">餐廳位置</h3>
            <p className="text-sm text-gray-600">台北市信義區美食路1段101號</p>
          </div>
        </div>
         <div className="bg-white p-4 rounded-xl shadow-sm flex items-start space-x-4" onClick={() => setView(AppView.FAQ)}>
          <HelpCircle className="text-gray-400 shrink-0" />
          <div>
            <h3 className="font-semibold">常見問題</h3>
            <p className="text-sm text-gray-600">點擊查看用餐須知</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Icon Wrappers
const UtensilsIcon = ({size, className}: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);
const CalendarIcon = ({size, className}: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default HomeView;