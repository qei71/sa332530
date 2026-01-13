import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import MenuView from './views/MenuView';
import ReservationView from './views/ReservationView';
import ProfileView from './views/ProfileView';
import AdminDashboard from './views/AdminDashboard';
import { AppView, CartItem, Member } from './types';
import { ADMIN_PHONES } from './constants';
import { api } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOADING);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    // Initialize LIFF logic or check local storage
    const init = async () => {
      // Simulate loading delay for the splash image
      setTimeout(() => {
        // Check if user is logged in (persisted)
        const savedMember = localStorage.getItem('member');
        if (savedMember) {
            setMember(JSON.parse(savedMember));
        }
        setCurrentView(AppView.HOME);
      }, 2500); 
    };
    init();
  }, []);

  const handleLogin = async (phone: string, name: string) => {
    // In a real app, verify OTP or Line Login here.
    // For this demo, we mock registration/login via phone.
    
    // Check Admin rights immediately
    const isAdmin = ADMIN_PHONES.includes(phone);

    // Mock object to update state immediately
    const newMember: Member = {
      id: 'temp',
      lineId: 'mock_line_id',
      name,
      phone,
      points: 0,
      isAdmin
    };

    setMember(newMember);
    localStorage.setItem('member', JSON.stringify(newMember));

    // Async sync to Google Sheet
    try {
        await api.registerMember({ lineId: 'mock_line_id', name, phone });
    } catch (e) {
        console.error("Sync error", e);
    }
  };

  const clearCart = () => setCart([]);

  if (currentView === AppView.LOADING) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl relative overflow-hidden">
      {/* View Router */}
      {currentView === AppView.HOME && <HomeView setView={setCurrentView} member={member} />}
      {currentView === AppView.MENU && <MenuView />}
      {currentView === AppView.RESERVATION && (
        <ReservationView 
            cart={cart} 
            setCart={setCart}
            user={member} 
            setView={setCurrentView} 
            clearCart={clearCart} 
        />
      )}
      {currentView === AppView.PROFILE && <ProfileView member={member} onLogin={handleLogin} />}
      {currentView === AppView.ADMIN && member?.isAdmin && <AdminDashboard />}
      
      {/* Fallback for LOCATION/FAQ placeholders */}
      {(currentView === AppView.LOCATION || currentView === AppView.FAQ) && (
        <div className="p-6 text-center pt-20">
            <h2 className="text-xl font-bold mb-4">即將開放</h2>
            <p className="text-gray-500">此功能正在建置中。</p>
            <button onClick={() => setCurrentView(AppView.HOME)} className="mt-8 text-primary font-bold">返回首頁</button>
        </div>
      )}

      {/* Navigation */}
      <BottomNav 
        currentView={currentView} 
        setView={setCurrentView} 
        isAdmin={!!member?.isAdmin} 
      />
    </div>
  );
};

export default App;