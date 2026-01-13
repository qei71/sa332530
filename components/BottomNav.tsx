import React from 'react';
import { AppView } from '../types';
import { Home, UtensilsCrossed, CalendarClock, User, ShieldCheck } from 'lucide-react';

interface Props {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAdmin: boolean;
}

const BottomNav: React.FC<Props> = ({ currentView, setView, isAdmin }) => {
  const navItems = [
    { view: AppView.HOME, label: '首頁', icon: Home },
    { view: AppView.MENU, label: '菜單', icon: UtensilsCrossed },
    { view: AppView.RESERVATION, label: '訂位', icon: CalendarClock },
    { view: AppView.PROFILE, label: '會員', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ view: AppView.ADMIN, label: '後台', icon: ShieldCheck });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === item.view ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;