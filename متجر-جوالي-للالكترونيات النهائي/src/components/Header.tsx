import React, { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, LogOut, LayoutDashboard, Store, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderTrackingModal } from './OrderTrackingModal';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: (mode: 'login' | 'register') => void;
  onAdminToggle: () => void;
  isAdminView: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  currentView?: 'store' | 'checkout' | 'chat';
  setCurrentView?: (v: 'store' | 'checkout' | 'chat') => void;
  onTrackingClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCartClick,
  onAuthClick,
  onAdminToggle,
  isAdminView,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  currentView,
  setCurrentView,
  onTrackingClick,
}) => {
  const { user, cart, logout, storeSettings } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [showSearch, setShowSearch] = useState(false);

  const customCategories = storeSettings?.categories && storeSettings.categories.length > 0
    ? storeSettings.categories
    : [
        { id: 'mobiles', label: 'موبايلات', icon: '📱', order: 1, active: true },
        { id: 'headphones', label: 'سماعات', icon: '🎧', order: 2, active: true },
        { id: 'watches', label: 'ساعات', icon: '⌚', order: 3, active: true },
        { id: 'covers', label: 'أغطية حماية', icon: '🛡️', order: 4, active: true },
        { id: 'chargers', label: 'شواحن', icon: '⚡', order: 5, active: true },
        { id: 'accessories', label: 'إكسسوارات', icon: '🔌', order: 6, active: true },
      ];

  const activeCategories = [...customCategories]
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);

  const categories = [
    { id: 'all', label: 'الكل' },
    ...activeCategories.map(c => ({ id: c.id, label: c.label }))
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-dark/10 shadow-xs" id="gawali-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className={`flex items-center gap-1 sm:gap-2 cursor-pointer shrink-0 ${showSearch ? 'hidden md:flex' : 'flex'}`} onClick={() => { setSelectedCategory('all'); if (isAdminView) onAdminToggle(); if (currentView === 'checkout' && setCurrentView) setCurrentView('store'); }}>
            {storeSettings?.storeLogo && (storeSettings.storeLogo.startsWith('http') || storeSettings.storeLogo.startsWith('/') || storeSettings.storeLogo.startsWith('data:') || storeSettings.storeLogo.length > 50) ? (
              <img 
                src={storeSettings.storeLogo} 
                alt={storeSettings.storeName || "Logo"} 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-brand-blue text-white p-1.5 sm:p-2.5 rounded-lg shadow-xs flex items-center justify-center font-black text-lg sm:text-xl tracking-tight leading-none">
                {storeSettings?.storeLogo || 'ج'}
              </div>
            )}
            <span className="text-base sm:text-2xl font-black text-brand-dark tracking-tight select-none">
              {storeSettings?.storeName ? (
                storeSettings.storeName.includes(' ') ? (
                  <>
                    {storeSettings.storeName.split(' ')[0]}
                    <span className="text-brand-blue font-black"> {storeSettings.storeName.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : storeSettings.storeName
              ) : 'جوالي'}<span className="text-brand-blue font-black">.</span>
            </span>
          </div>

          {/* Search popover - triggered by search button */}
          {!isAdminView && showSearch && (
            <div className="flex-grow max-w-full sm:max-w-md relative animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="ابحث عن هاتف، سماعة، شاحن، أو غطاء..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-sand/30 border border-brand-dark/15 rounded-lg py-2.5 pr-11 pl-10 text-xs sm:text-sm focus:outline-hidden focus:border-brand-blue focus:bg-white transition-all text-right placeholder:text-slate-400 font-bold text-brand-dark"
                dir="rtl"
                autoFocus
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
              <button
                onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-dark font-bold text-xs"
                title="إغلاق البحث"
              >
                ✕
              </button>
            </div>
          )}

          {/* User Controls */}
          <div className={`flex items-center gap-1.5 sm:gap-3 shrink-0 ${showSearch ? 'hidden md:flex' : 'flex'}`}>
            {/* Admin Toggle button if user is admin */}
            {user?.role === 'admin' && (
              <button
                onClick={onAdminToggle}
                className="flex items-center gap-1.5 bg-brand-dark text-white px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-sm hover:bg-brand-blue transition-colors shadow-sm"
                id="admin-view-toggle"
              >
                {isAdminView ? (
                  <>
                    <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>عرض المتجر</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>لوحة التحكم</span>
                  </>
                )}
              </button>
            )}

            {/* Search Toggler Button - next to cart */}
            {!isAdminView && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1.5 sm:p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  showSearch
                    ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30 ring-2 ring-brand-blue/10'
                    : 'bg-brand-sand/30 text-brand-dark border-brand-dark/10 hover:bg-brand-sand'
                }`}
                title="بحث"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Order Tracking Truck Button */}
            {!isAdminView && (
              <button
                onClick={onTrackingClick}
                className="bg-brand-sand/30 text-brand-dark p-1.5 sm:p-2.5 rounded-lg hover:bg-brand-sand transition-colors border border-brand-dark/10 flex items-center justify-center cursor-pointer gap-1 sm:gap-1.5 px-2 sm:px-3.5"
                title="تتبع شحنتك"
                id="track-order-trigger-button"
              >
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue shrink-0" />
                <span className="text-[10px] sm:text-xs font-black text-brand-dark hidden lg:inline">تتبع طلبك</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            {!isAdminView && (
              <button
                onClick={onCartClick}
                className="relative bg-brand-sand/30 text-brand-dark p-1.5 sm:p-2.5 rounded-lg hover:bg-brand-sand transition-colors border border-brand-dark/10 flex items-center justify-center cursor-pointer"
                id="cart-trigger-button"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-brand-blue text-white text-[8px] sm:text-[9px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex flex-col text-right max-w-[60px] sm:max-w-[120px]">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">أهلاً بك</span>
                  <span className="text-[10px] sm:text-xs font-black text-brand-dark truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-50/50 text-red-600 p-1.5 sm:p-2.5 rounded-lg hover:bg-red-100 transition-colors border border-red-200/40 flex items-center justify-center cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onAuthClick('login')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 sm:py-2.5 sm:px-4 rounded-xl text-[10px] sm:text-sm font-black transition-all cursor-pointer shadow-xs hover:shadow-md shrink-0 animate-pulse-slow"
                  id="login-modal-trigger"
                  title="تسجيل الدخول"
                >
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  <span>دخول</span>
                </button>
                <button
                  onClick={() => onAuthClick('register')}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 px-2 sm:py-2.5 sm:px-4 rounded-xl text-[10px] sm:text-sm font-black transition-all cursor-pointer border border-slate-200 shrink-0"
                  id="register-modal-trigger"
                  title="إنشاء حساب جديد"
                >
                  <span>سجل</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories Bar and Mobile Search (Only visible on main store page) */}
        {!isAdminView && (
          <div className="mt-4 pt-3 border-t border-brand-dark/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Horizontal scrollable categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); if (currentView === 'checkout' && setCurrentView) setCurrentView('store'); }}
                  className={`text-xs py-2 px-4 rounded-md font-black shrink-0 transition-all duration-200 border cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-dark border-brand-dark/10 hover:bg-brand-sand'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              فئات المتجر المتوازنة هندسياً 📐
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
