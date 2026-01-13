import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MenuItem, CartItem, AppView, NOODLE_OPTIONS, COMBO_OPTIONS } from '../types';
import { TIME_SLOTS, FOOD_CATEGORIES } from '../constants';
import { ShoppingCart, Plus, X, ChevronRight, Check } from 'lucide-react';

interface Props {
  cart: CartItem[];
  user: { name: string; phone: string } | null;
  setView: (view: AppView) => void;
  clearCart: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const ReservationView: React.FC<Props> = ({ cart, user, setView, clearCart, setCart }) => {
  const [step, setStep] = useState<'info' | 'ordering'>('info');
  
  // Booking State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [pax, setPax] = useState(2);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Ordering State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(FOOD_CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Modifier State for Modal
  const [selectedNoodle, setSelectedNoodle] = useState(NOODLE_OPTIONS[0]);
  const [selectedCombo, setSelectedCombo] = useState(COMBO_OPTIONS[0]);
  const [selectedDrink, setSelectedDrink] = useState<string>('');
  const [spiceLevel, setSpiceLevel] = useState('正常');

  useEffect(() => {
    // Load menu data
    const loadMenu = async () => {
      // Simulate or fetch data
      const res = await api.getRestaurantItems();
      if (res.success && res.data) {
        setMenuItems(res.data);
      } else {
        // Fallback or empty state
        setMenuItems([]); 
      }
    };
    loadMenu();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const day = selectedDate.getDay();
    if (day === 1) {
      setError('抱歉，餐廳每週一公休，請選擇其他日期。');
      setDate('');
    } else {
      setError('');
      setDate(e.target.value);
    }
  };

  const handleNextStep = () => {
    if (!date || !time || !name || !phone) {
      setError('請填寫完整訂位資訊');
      return;
    }
    setStep('ordering');
  };

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    // Reset modifiers
    setSelectedNoodle(NOODLE_OPTIONS[0]);
    setSelectedCombo(COMBO_OPTIONS[0]);
    setSelectedDrink('');
    setSpiceLevel('不辣');
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    if (selectedCombo.id !== 'none' && !selectedDrink) {
      alert("請選擇套餐飲品！");
      return;
    }

    const newItem: CartItem = {
      ...selectedItem,
      uniqueId: Date.now().toString(),
      quantity: 1,
      selectedNoodle: selectedItem.hasNoodleSelection ? selectedNoodle.name : undefined,
      noodlePrice: selectedItem.hasNoodleSelection ? selectedNoodle.price : 0,
      selectedCombo: selectedCombo.id !== 'none' ? selectedCombo.name : undefined,
      comboPrice: selectedCombo.price,
      selectedDrink: selectedCombo.id !== 'none' ? selectedDrink : undefined,
      note: spiceLevel
    };

    setCart(prev => [...prev, newItem]);
    setSelectedItem(null);
  };

  const removeCartItem = (uniqueId: string) => {
    setCart(prev => prev.filter(i => i.uniqueId !== uniqueId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      let itemTotal = item.price;
      if (item.noodlePrice) itemTotal += item.noodlePrice;
      if (item.comboPrice) itemTotal += item.comboPrice;
      return sum + (itemTotal * item.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const reservationData = {
      name,
      phone,
      date,
      time,
      pax,
      items: JSON.stringify(cart),
      totalAmount: calculateTotal()
    };

    try {
      const res = await api.makeReservation(reservationData);
      if (res.success) {
        alert(`訂位成功！\n訂位代號: ${res.reservationId}\n桌號已分配: ${res.tableId}`);
        clearCart();
        setView(AppView.PROFILE);
      } else {
        setError('訂位失敗: ' + res.error);
      }
    } catch (e) {
      setError('網路錯誤，請稍後再試');
    }
    setIsSubmitting(false);
  };

  const drinks = menuItems.filter(i => i.isDrink);
  const displayedItems = activeCategory 
    ? menuItems.filter(i => i.category && i.category.includes(activeCategory))
    : menuItems;

  if (step === 'info') {
    return (
      <div className="pb-24 min-h-screen bg-gray-50 p-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Step 1: 填寫訂位資訊</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期 (週一公休)</label>
            <input 
              type="date" 
              value={date} 
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-2 focus:ring-primary outline-none"
            />
            {error && date === '' && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`text-sm py-2 rounded-lg border ${
                    time === t 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">人數</label>
            <div className="flex items-center space-x-4">
               <button onClick={() => setPax(Math.max(1, pax - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">-</button>
               <span className="text-xl font-bold w-8 text-center">{pax}</span>
               <button onClick={() => setPax(Math.min(10, pax + 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">+</button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">訂位人姓名</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入姓名"
                className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-4 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-lg shadow-lg"
          >
            下一步：預先點餐
          </button>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // Ordering Step
  return (
    <div className="pb-32 min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white z-20 shadow-sm">
        <div className="flex items-center p-4 border-b">
           <button onClick={() => setStep('info')} className="text-gray-500 text-sm">‹ 返回資訊</button>
           <h2 className="flex-1 text-center font-bold">預先點餐 (可選)</h2>
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto p-2 space-x-2 bg-gray-50">
          {FOOD_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-4">
        {displayedItems.length === 0 && <div className="text-center text-gray-400 py-10">此分類尚無餐點</div>}
        
        {displayedItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex space-x-3" onClick={() => openItemModal(item)}>
             <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                {item.image ? (
                   <img src={item.image} className="w-full h-full object-cover" />
                ) : (
                   <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Img</span>
                )}
             </div>
             <div className="flex-1 flex flex-col justify-between">
               <div>
                  <div className="flex items-start justify-between">
                     <h3 className="font-bold text-gray-800">{item.name}</h3>
                     <span className="font-bold text-primary">${item.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                     {item.tags?.includes('spicy') && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">🌶️</span>}
                     {item.tags?.includes('beef') && <span className="text-[10px] bg-brown-100 text-yellow-800 px-1 rounded">🐮</span>}
                     {item.category.includes('素') && <span className="text-[10px] bg-green-100 text-green-600 px-1 rounded">🥦</span>}
                  </div>
               </div>
               <button className="self-end bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mt-2">
                 + 選擇
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* Cart Summary & Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-30 pb-safe">
        {cart.length > 0 && (
          <div className="max-h-32 overflow-y-auto mb-2 border-b pb-2">
            {cart.map((c, i) => (
              <div key={c.uniqueId} className="flex justify-between items-center text-sm py-1">
                 <div className="flex-1">
                    <span className="font-bold">{c.name}</span>
                    {c.selectedNoodle && <span className="text-xs text-gray-500 ml-1">({c.selectedNoodle})</span>}
                    {c.selectedCombo && <span className="text-xs text-primary ml-1">+{c.selectedCombo}</span>}
                 </div>
                 <div className="flex items-center space-x-2">
                    <span>${(c.price + (c.noodlePrice||0) + (c.comboPrice||0))}</span>
                    <button onClick={() => removeCartItem(c.uniqueId)} className="text-red-500"><X size={14}/></button>
                 </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
           <span className="text-gray-600">預計總額: <strong className="text-xl text-black">${calculateTotal()}</strong></span>
           <span className="text-xs text-gray-400">現場結帳</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl text-white font-bold text-lg shadow-md flex items-center justify-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-secondary'
          }`}
        >
          {isSubmitting ? '處理中...' : '確認訂位並送出'}
        </button>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
               <h3 className="font-bold text-lg">{selectedItem.name}</h3>
               <button onClick={() => setSelectedItem(null)}><X /></button>
            </div>
            
            <div className="p-4 space-y-6">
               {/* 1. Noodle Selection (Mandatory for Pasta) */}
               {selectedItem.hasNoodleSelection && (
                 <div>
                    <h4 className="font-bold text-gray-700 mb-2">麵條選擇 <span className="text-red-500">*</span></h4>
                    <div className="grid grid-cols-2 gap-2">
                       {NOODLE_OPTIONS.map(opt => (
                         <button 
                           key={opt.name}
                           onClick={() => setSelectedNoodle(opt)}
                           className={`p-2 rounded-lg border text-sm text-left flex justify-between ${selectedNoodle.name === opt.name ? 'border-primary bg-orange-50 text-primary ring-1 ring-primary' : 'border-gray-200'}`}
                         >
                            <span>{opt.name}</span>
                            {opt.price > 0 && <span>+${opt.price}</span>}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* 2. Spice Level */}
               <div>
                  <h4 className="font-bold text-gray-700 mb-2">辣度調整</h4>
                  <div className="flex gap-2">
                     {['不辣', '小辣', '中辣', '大辣'].map(l => (
                       <button 
                         key={l} 
                         onClick={() => setSpiceLevel(l)}
                         className={`px-3 py-1 rounded-full text-sm border ${spiceLevel === l ? 'bg-red-500 text-white border-red-500' : 'text-gray-600'}`}
                       >
                         {l}
                       </button>
                     ))}
                  </div>
               </div>

               {/* 3. Upsell Combo */}
               {selectedItem.allowCombo && (
                 <div>
                    <h4 className="font-bold text-primary mb-2">超值升級？</h4>
                    <div className="space-y-2">
                       {COMBO_OPTIONS.map(opt => (
                         <div 
                           key={opt.id}
                           onClick={() => setSelectedCombo(opt)}
                           className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${selectedCombo.id === opt.id ? 'border-primary bg-orange-50 ring-1 ring-primary' : 'border-gray-200'}`}
                         >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCombo.id === opt.id ? 'border-primary' : 'border-gray-300'}`}>
                                 {selectedCombo.id === opt.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                              </div>
                              <span className="font-medium">{opt.name}</span>
                            </div>
                            <span className="font-bold text-gray-700">+${opt.price}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* 4. Drink Selection (Condition: Combo Selected) */}
               {selectedCombo.id !== 'none' && (
                 <div className="bg-gray-50 p-3 rounded-lg animate-fade-in">
                    <h4 className="font-bold text-gray-700 mb-2">選擇附餐飲品 <span className="text-red-500">*</span></h4>
                    <div className="grid grid-cols-2 gap-2">
                       {drinks.map(d => (
                         <button 
                            key={d.id}
                            onClick={() => setSelectedDrink(d.name)}
                            className={`p-2 rounded text-sm bg-white border ${selectedDrink === d.name ? 'border-primary text-primary font-bold' : 'border-gray-200'}`}
                         >
                            {d.name}
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="p-4 border-t">
               <button 
                 onClick={handleAddToCart}
                 className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow hover:bg-secondary"
               >
                 加入訂單 (+${selectedItem.price + (selectedItem.hasNoodleSelection ? selectedNoodle.price : 0) + selectedCombo.price})
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationView;