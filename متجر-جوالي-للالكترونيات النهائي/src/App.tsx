import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ChatBot } from './components/ChatBot';
import { HeroSlider } from './components/HeroSlider';
import { CustomerReviews } from './components/CustomerReviews';
import { FaqSection } from './components/FaqSection';
import { Product } from './types';
import { SlidersHorizontal, Sparkles, RefreshCw, AlertCircle, ArrowRight, Smartphone, Truck } from 'lucide-react';

// Lazy load large non-critical sections for 90%+ bundle size reduction
const ProductDetailsModal = React.lazy(() => import('./components/ProductDetailsModal').then(m => ({ default: m.ProductDetailsModal })));
const CheckoutSection = React.lazy(() => import('./components/CheckoutSection').then(m => ({ default: m.CheckoutSection })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ChatPage = React.lazy(() => import('./components/ChatPage').then(m => ({ default: m.ChatPage })));
const OrderTrackingModal = React.lazy(() => import('./components/OrderTrackingModal').then(m => ({ default: m.OrderTrackingModal })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[350px]" dir="rtl">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-transparent"></div>
    <p className="mt-4 text-xs font-bold text-slate-500">جاري تحميل القسم...</p>
  </div>
);

interface CategoryCardItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  image?: string;
}

const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic diacritics
};

function Storefront() {
  const { products, user, storeSettings, logout } = useStore();

  const customCategories = storeSettings?.categories && storeSettings.categories.length > 0
    ? storeSettings.categories
    : [
        { id: 'mobiles', label: 'موبايلات', icon: '📱', order: 1, active: true, desc: 'هواتف ذكية راقية ومدعومة بالكامل' },
        { id: 'headphones', label: 'سماعات', icon: '🎧', order: 2, active: true, desc: 'سماعات رأس وصوت محيطي نقي' },
        { id: 'watches', label: 'ساعات', icon: '⌚', order: 3, active: true, desc: 'ساعات ذكية رياضية وصحية راقية' },
        { id: 'covers', label: 'غطية حماية', icon: '🛡️', order: 4, active: true, desc: 'جرابات MagSafe وحماية للصدمات' },
        { id: 'chargers', label: 'شواحن', icon: '⚡', order: 5, active: true, desc: 'قوالب شحن سريعة وراسية فائقة' },
        { id: 'accessories', label: 'إكسسوارات', icon: '🔌', order: 6, active: true, desc: 'قطع، منصات تثبيت، ولوازم ذكية' }
      ];

  const activeCustomCategories = [...customCategories]
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);

  const categoryCards: CategoryCardItem[] = [
    { id: 'all', label: 'الكل', icon: '🌐', desc: 'تصفح كافة المعروض للمتجر', image: '' },
    ...activeCustomCategories.map(c => ({
      id: c.id,
      label: c.label,
      icon: c.icon || '📦',
      desc: c.desc || '',
      image: c.image || ''
    }))
  ];

  // App Toggles and Modal views switcher states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentView, setCurrentView] = useState<'store' | 'checkout' | 'chat'>('store');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Browser Back Button Navigation & History Management
  const isPopStateRef = React.useRef(false);

  // Initialize history state on mount
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({
        isAdminView: false,
        currentView: 'store',
        selectedProductId: null,
        isTrackingOpen: false,
        isCartOpen: false
      }, '');
    }
  }, []);

  // Monitor React navigation/modal states and push to browser history on user change
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const currentState = {
      isAdminView,
      currentView,
      selectedProductId: selectedProduct?.id || null,
      isTrackingOpen,
      isCartOpen
    };

    const historyState = window.history.state;
    if (
      !historyState ||
      historyState.isAdminView !== currentState.isAdminView ||
      historyState.currentView !== currentState.currentView ||
      historyState.selectedProductId !== currentState.selectedProductId ||
      historyState.isTrackingOpen !== currentState.isTrackingOpen ||
      historyState.isCartOpen !== currentState.isCartOpen
    ) {
      window.history.pushState(currentState, '');
    }
  }, [isAdminView, currentView, selectedProduct, isTrackingOpen, isCartOpen]);

  // Handle popstate event (when user clicks browser or hardware Back button)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        isPopStateRef.current = true;
        
        setIsAdminView(e.state.isAdminView);
        setCurrentView(e.state.currentView);
        setIsTrackingOpen(e.state.isTrackingOpen);
        setIsCartOpen(e.state.isCartOpen);
        
        if (e.state.selectedProductId) {
          const found = products.find((p) => p.id === e.state.selectedProductId);
          if (found) {
            setSelectedProduct(found);
          } else {
            setSelectedProduct(null);
          }
        } else {
          setSelectedProduct(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [products]);

  // Scroll to top on page/view transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, isAdminView]);

  // Guard admin view reactively
  useEffect(() => {
    if (isAdminView && user?.role !== 'admin') {
      setIsAdminView(false);
    }
  }, [isAdminView, user]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Sub-category routing logic for Mobiles and Headphones
  const [mobileCondition, setMobileCondition] = useState<'new' | 'used' | null>(null);
  const [headphonesSubCategory, setHeadphonesSubCategory] = useState<'airpods' | 'overear' | 'speakers' | 'wired' | null>(null);

  useEffect(() => {
    setMobileCondition(null);
    setHeadphonesSubCategory(null);
  }, [selectedCategory]);

  // Dynamically calculate highest price in current products catalog (or fallback to 200,000 EGP max)
  const highestPriceInCatalog = React.useMemo(() => {
    if (!products || products.length === 0) return 200000;
    return Math.max(...products.map((p) => p.price), 200000);
  }, [products]);

  // Gather unique available Brands for quick dynamic filters
  const availBrands = React.useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.brand)))];
  }, [products]);

  // Primary filtering query matching logic with Arabic normalizer
  const filteredProducts = React.useMemo(() => {
    const normalizedSearch = normalizeArabic(searchQuery);
    const filtered = products.filter((p) => {
      // 1. Exact Category Mapping
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

      // Sub-segment condition matching (New vs Used)
      const matchesCondition =
        selectedCategory !== 'mobiles' ||
        !mobileCondition ||
        p.condition === mobileCondition ||
        (!p.condition && mobileCondition === 'new');

      // Sub-segment subCategory matching for Headphones
      const resolvedSubCategory = p.subCategory || (() => {
        if (p.category !== 'headphones') return undefined;
        const nameLower = p.name.toLowerCase();
        const descLower = p.description.toLowerCase();
        if (nameLower.includes('مكبر') || nameLower.includes('سبيكر') || nameLower.includes('صب') || descLower.includes('مكبر صوت')) {
          return 'speakers';
        }
        if (nameLower.includes('سلك') || nameLower.includes('سلكية') || nameLower.includes('earpods')) {
          return 'wired';
        }
        if (
          nameLower.includes('آيربودز') || 
          nameLower.includes('ايربودز') || 
          nameLower.includes('airpods pro') || 
          nameLower.includes('buds') || 
          nameLower.includes('freebuds') || 
          nameLower.includes('elite') || 
          nameLower.includes('wave') ||
          nameLower.includes('سماعة داخل الأذن')
        ) {
          return 'airpods';
        }
        return 'overear';
      })();

      const matchesHeadphonesSub =
        selectedCategory !== 'headphones' ||
        !headphonesSubCategory ||
        resolvedSubCategory === headphonesSubCategory;

      // 2. Search query matching with Arabic normalization
      const matchesSearch =
        normalizedSearch === '' ||
        normalizeArabic(p.name).includes(normalizedSearch) ||
        normalizeArabic(p.description).includes(normalizedSearch) ||
        normalizeArabic(p.brand).includes(normalizedSearch);

      // 3. Price Limit
      const matchesPrice = p.price <= maxPrice;

      // 4. Brand selector tag matching
      const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;

      return matchesCategory && matchesCondition && matchesHeadphonesSub && matchesSearch && matchesPrice && matchesBrand;
    });

    // Sort by displayOrder desc (admin's custom order), then by createdAt desc/id desc
    return [...filtered].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderB !== orderA) {
        return orderB - orderA;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [products, selectedCategory, mobileCondition, headphonesSubCategory, searchQuery, maxPrice, selectedBrand]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(200000);
    setSelectedBrand('all');
    setMobileCondition(null);
    setHeadphonesSubCategory(null);
  };

  if (user?.blocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-red-100 text-center space-y-6 animate-in fade-in zoom-in duration-350">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-800">حسابك محظور مؤقتاً</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              تم حظر هذا الحساب من قبل إدارة متجر Gawali بسبب مخالفة السياسات أو شروط الاستخدام. يرجى مراجعة الدعم الفني لإلغاء الحظر.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => logout()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md cursor-pointer"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50" dir="rtl">
      {/* Dynamic Announcement Bar */}
      {storeSettings?.homepageAnnouncement && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-center py-2.5 px-4 text-xs font-bold shadow-xs flex items-center justify-center gap-2 select-none animate-in fade-in slide-in-from-top duration-300">
          <span className="inline-block animate-pulse">📢</span>
          <span>{storeSettings.homepageAnnouncement}</span>
        </div>
      )}

      {/* Dynamic Navigation Header component */}
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onAdminToggle={() => setIsAdminView(!isAdminView)}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onTrackingClick={() => setIsTrackingOpen(true)}
      />

      {/* Primary body switcher */}
      <main className="flex-grow">
        {isAdminView && user?.role === 'admin' ? (
          // 1. Admin Control Dashboard view
          <React.Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </React.Suspense>
        ) : currentView === 'checkout' ? (
          // 2. Place/Verify Order checkout screens
          <React.Suspense fallback={<LoadingSpinner />}>
            <CheckoutSection 
              onBackToStore={() => setCurrentView('store')} 
              onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }}
            />
          </React.Suspense>
        ) : currentView === 'chat' ? (
          // 3. Dedicated AI Chatbot screen
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <React.Suspense fallback={<LoadingSpinner />}>
              <ChatPage onBackToStore={() => setCurrentView('store')} />
            </React.Suspense>
          </div>
        ) : (
          // 4. Standard Storefront grid layout
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Quick Explore Categories Dynamic Hub */}
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-1 text-right">
                <h2 className="text-md sm:text-lg font-black text-slate-900 tracking-tight">تسوّق حسب الأقسام الرئيسية للمتجر</h2>
                <p className="text-xs text-slate-400 font-bold">اضغط على أي قسم بالأسفل لتصفية المنتجات ورؤيتها فوراً!</p>
              </div>
            </div>

            {/* Responsive grid of large clickable categories */}
            <div 
              className="flex overflow-x-auto gap-3 pb-4 lg:grid lg:gap-4 mb-10 no-scrollbar select-none" 
              id="premium-category-cards-hub"
              style={{ gridTemplateColumns: `repeat(${categoryCards.length}, minmax(0, 1fr))` }}
            >
              {categoryCards.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedBrand('all'); // Clear brand filter to let user view everything in that category
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border text-right transition-all duration-300 cursor-pointer flex flex-row items-center gap-2 lg:flex-col lg:justify-between h-14 sm:h-16 lg:h-36 shrink-0 w-[130px] sm:w-[150px] lg:w-auto relative overflow-hidden group/cat ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100 scale-[1.02] z-10'
                        : 'bg-white text-slate-800 border-slate-100 hover:border-blue-200 hover:shadow-md'
                    }`}
                  >
                    {/* Background visual asset */}
                    {cat.image || (cat.icon && (cat.icon.startsWith('data:') || cat.icon.startsWith('http') || cat.icon.startsWith('/') || cat.icon.length > 50)) ? (
                      <div className="absolute -bottom-4 -left-4 w-20 h-20 opacity-15 blur-xs group-hover/cat:scale-120 transition-transform duration-500 select-none hidden lg:block">
                        <img src={cat.image || cat.icon} alt="" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className={`absolute -bottom-4 -left-4 text-6xl opacity-10 group-hover/cat:scale-120 transition-transform duration-500 select-none hidden lg:block ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {cat.icon}
                      </div>
                    )}

                    <div className="flex items-center gap-2 lg:block">
                      {cat.image || (cat.icon && (cat.icon.startsWith('data:') || cat.icon.startsWith('http') || cat.icon.startsWith('/') || cat.icon.length > 50)) ? (
                        <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden border border-slate-100/20 shadow-2xs group-hover/cat:scale-110 transition-transform duration-300">
                          <img src={cat.image || cat.icon} alt={cat.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <span className={`text-xl sm:text-2xl lg:text-3xl block transition-transform duration-300 group-hover/cat:scale-110 ${isActive ? 'scale-110' : ''}`}>
                          {cat.icon}
                        </span>
                      )}
                      <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none lg:mb-1 lg:mt-2">
                        {cat.label}
                      </h3>
                    </div>

                    <p className={`text-[10px] leading-tight font-bold hidden lg:block ${isActive ? 'text-blue-100' : 'text-slate-400'} line-clamp-2 max-w-[95%] z-10`}>
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedCategory === 'mobiles' && mobileCondition === null ? (
              /* Mobiles Intermediate Choice Subpages (New vs Used) */
              <div className="space-y-8 max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Option 1: New Mobiles */}
                  <button
                    onClick={() => setMobileCondition('new')}
                    className="p-8 bg-white border border-slate-100 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-blue-50 text-blue-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-blue-100 shadow-2xs">
                      جديد بالكامل 🌟
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-blue-100/40 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        📱
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">موبايلات جديدة كلياً</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          أقوى وأحدث الإصدارات من كبرى الشركات العالمية مثل Apple و Samsung، داعمة لأحدث تقنيات الذكاء الاصطناعي مع ضمان الوكيل وعلب مصنعية مغلقة.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح الموبايلات الجديدة</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Option 2: Used Mobiles */}
                  <button
                    onClick={() => setMobileCondition('used')}
                    className="p-8 bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-indigo-50 text-indigo-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-indigo-100 shadow-2xs">
                      كسر زيرو ممتاز ✨
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-indigo-100/40 shadow-xs group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                        🔍
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">أجهزة مستعملة كسر زيرو</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          وفر بذكاء مع أجهزة مستعملة متميزة خالية تماماً من عيوب الاستخدام، تم فحصها من 50 نقطة فنية مختلفة وتأتي مع ضمان خاص بمتجر جوالي.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح الموبايلات المستعملة</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            ) : selectedCategory === 'headphones' && headphonesSubCategory === null ? (
              /* Headphones 4 Sub-categories Choice */
              <div className="space-y-8 max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">


                {/* Subcategories grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {/* Option 1: AirPods (ايربودز) */}
                  <button
                    onClick={() => setHeadphonesSubCategory('airpods')}
                    className="p-8 bg-white border border-slate-100 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-blue-50 text-blue-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-blue-100 shadow-2xs">
                      سماعات ذكية 📶
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-blue-100/40 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        🎵
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors">ايربودز (AirPods)</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          سماعات داخل الأذن لاسلكية فائقة الحرية والذكاء بأعلى نقاوة صوتية، مثالية للمكالمات الطويلة والاستماع اليومي المريح.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح ايربودز</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Option 2: Headphones (هيدفون) */}
                  <button
                    onClick={() => setHeadphonesSubCategory('overear')}
                    className="p-8 bg-white border border-slate-100 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-indigo-50 text-indigo-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-indigo-100 shadow-2xs">
                      عزل صوتي نشط 🔇
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-indigo-100/40 shadow-xs group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                        🎧
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">هيدفون (Headphones)</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          سماعات رأس لاسلكية فوق الأذن بأقوى تقنيات عزل الضوضاء المحيطة، توفر لك تجربة سينمائية وصوتية غامرة للغاية.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح الهيدفون</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Option 3: Speakers / Subwoofers (صبات) */}
                  <button
                    onClick={() => setHeadphonesSubCategory('speakers')}
                    className="p-8 bg-white border border-slate-100 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-emerald-100 shadow-2xs">
                      صوت مجسم قوي 🔊
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-emerald-100/40 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        🔊
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-emerald-600 transition-colors">صبات وسبيكرز (Speakers)</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          مكبرات صوت لاسلكية متميزة بصوت مجسم قوي وبيس عميق، مثالية للحفلات والأنشطة الخارجية.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح الصبات</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Option 4: Wired Earphones (سماعات سلك) */}
                  <button
                    onClick={() => setHeadphonesSubCategory('wired')}
                    className="p-8 bg-white border border-slate-100 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/5 rounded-3xl transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[220px] text-right cursor-pointer"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-amber-50 text-amber-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-amber-100 shadow-2xs">
                      اعتمادية عالية 🔌
                    </div>

                    <div className="space-y-4">
                      {/* Icon with beautiful gradient glow container */}
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border border-amber-100/40 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        🔌
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">سماعات سلكية</h3>
                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                          سماعات أذن سلكية ذات جودة تصنيع فائقة وصوت عالي النقاء وعمر افتراضي أطول بدون شحن.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 pt-4 group-hover:-translate-x-2 transition-transform duration-300">
                      <span>تصفح السماعات السلكية</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>

                {/* Gawali Trust Pillars / Benefits bento grid */}
                <div className="space-y-4">
                  <div className="text-right">
                    <h3 className="text-lg font-black text-brand-dark">لماذا متجر جوالـي الخيار الأول؟ ⭐</h3>
                    <p className="text-xs text-slate-400 font-bold">كل ما تحتاجه لتجربة شراء مريحة، موثوقة وآمنة تماماً.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 border border-brand-dark/15 hover:border-brand-blue/30 rounded-xl space-y-3 transition duration-300 shadow-xs group">
                      <div className="w-11 h-11 rounded-lg bg-brand-sand/50 border border-brand-dark/10 text-brand-dark flex items-center justify-center text-xl group-hover:scale-105 duration-300">
                        🛡️
                      </div>
                      <h4 className="text-sm font-black text-brand-dark">أصلي ومضمون 100%</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        جميع أجهزتنا تأتي مباشرة من الوكيل المعتمد في علبها المصنعية الأصلية مع شهادة ضمان حقيقية.
                      </p>
                    </div>

                    <div className="bg-white p-6 border border-brand-dark/15 hover:border-brand-blue/30 rounded-xl space-y-3 transition duration-300 shadow-xs group">
                      <div className="w-11 h-11 rounded-lg bg-brand-sand/50 border border-brand-dark/10 text-brand-dark flex items-center justify-center text-xl group-hover:scale-105 duration-300">
                        🤖
                      </div>
                      <h4 className="text-sm font-black text-brand-dark">دعم ذكي بالذكاء الاصطناعي</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        مساعدنا الذكي Gawali AI متواجد معك على مدار الساعة ليساعدك في اختيار المنتج الأنسب ومتابعة مشترياتك.
                      </p>
                    </div>

                    <div className="bg-white p-6 border border-brand-dark/15 hover:border-brand-blue/30 rounded-xl space-y-3 transition duration-300 shadow-xs group">
                      <div className="w-11 h-11 rounded-lg bg-brand-sand/50 border border-brand-dark/10 text-brand-dark flex items-center justify-center text-xl group-hover:scale-105 duration-300">
                        🚚
                      </div>
                      <h4 className="text-sm font-black text-brand-dark">شحن آمن وتتبع دقيق</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        تتبع شحنتك لحظة بلحظة منذ خروجها من مخازننا عبر واجهتنا السلسة للتتبع الدقيق حتى وصولها لباب بيتك.
                      </p>
                    </div>

                    <div className="bg-white p-6 border border-brand-dark/15 hover:border-brand-blue/30 rounded-xl space-y-3 transition duration-300 shadow-xs group">
                      <div className="w-11 h-11 rounded-lg bg-brand-sand/50 border border-brand-dark/10 text-brand-dark flex items-center justify-center text-xl group-hover:scale-105 duration-300">
                        💳
                      </div>
                      <h4 className="text-sm font-black text-brand-dark">خيارات دفع آمنة</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        وسائل دفع رقمية وحلول ائتمانية مشفرة تماماً لضمان سرية وأمان معلوماتك المالية في كل عملية شراء.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show a mini featured highlights section of 3 products so the page still has life */}
                {products && products.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>أبرز الإضافات المميزة بالمعرض ✨</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold">تحديث فوري</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {products.slice(0, 3).map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onProductClick={(p) => setSelectedProduct(p)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Customer Reviews Section */}
                <CustomerReviews />

                {/* FAQ Accordion Section */}
                <FaqSection />
              </div>
            ) : (
              /* Layout divided: Sidebar filter options + Main grid results */
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Filter Sidebar controls */}
                <aside className="w-full lg:w-1/4 shrink-0 space-y-6 hidden lg:block" id="filters-desktop-sidebar">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-6">
                  
                  {/* Header Title */}
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-800">تصفية النتائج</h3>
                    </div>

                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة ضبط</span>
                    </button>
                  </div>

                  {/* Brand dynamic selectors */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800">تفـضيل حسب الـعلامة</h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {availBrands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${
                            selectedBrand === brand
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                        >
                          {brand === 'all' ? 'الكل' : brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price budget helper range filter */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500">الحد الأقصى للسعر</span>
                      <span className="text-blue-600 font-extrabold font-sans">
                        {maxPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={200000}
                      step={500}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 font-sans">
                      <span>١٠٠ ج.م</span>
                      <span>٢٠٠,٠٠٠ ج.م</span>
                    </div>
                  </div>

                </div>
              </aside>

              {/* Main Products Grid results column */}
              <div className="w-full lg:w-3/4">
                
                {/* Back button for mobiles condition select */}
                {selectedCategory === 'mobiles' && mobileCondition && (
                  <button
                    onClick={() => setMobileCondition(null)}
                    className="mb-4 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-extrabold bg-blue-50/70 border border-blue-100 hover:bg-blue-100/70 py-2.5 px-4.5 rounded-xl transition duration-300 cursor-pointer shadow-2xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة لاختيار فئة الجوالات (جديدة / مستعملة)</span>
                  </button>
                )}

                {/* Back button for headphones subcategory select */}
                {selectedCategory === 'headphones' && headphonesSubCategory && (
                  <button
                    onClick={() => setHeadphonesSubCategory(null)}
                    className="mb-4 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-extrabold bg-blue-50/70 border border-blue-100 hover:bg-blue-100/70 py-2.5 px-4.5 rounded-xl transition duration-300 cursor-pointer shadow-2xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة لاختيار فئة السماعات (ايربودز / هيدفون / صبات / سماعات سلك)</span>
                  </button>
                )}

                {/* Statistics header */}
                <div className="flex items-center justify-between mb-6 text-xs text-slate-400 font-semibold bg-white py-3 px-4 rounded-xl border border-slate-50 shadow-2xs">
                  <span>عدد المنتجات المعروضة: {filteredProducts.length} نتائج</span>
                  {selectedCategory !== 'all' && (
                    <span>
                      تصنيف نشط:{' '}
                      <span className="text-blue-600 font-bold">
                        {(() => {
                          const cat = customCategories.find(c => c.id === selectedCategory);
                          const label = cat ? cat.label : selectedCategory;
                          if (selectedCategory === 'mobiles') {
                            return `موبايلات (${mobileCondition === 'used' ? 'مستعملة' : 'جديدة'})`;
                          } else if (selectedCategory === 'headphones') {
                            return `سماعات (${
                              headphonesSubCategory === 'airpods'
                                ? 'ايربودز'
                                : headphonesSubCategory === 'overear'
                                ? 'هيدفون'
                                : headphonesSubCategory === 'speakers'
                                ? 'صبات'
                                : headphonesSubCategory === 'wired'
                                ? 'سماعات سلك'
                                : 'الكل'
                            })`;
                          }
                          return label;
                        })()}
                      </span>
                    </span>
                  )}
                </div>

                {/* Empty listings alert placeholder box */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-white border rounded-2xl p-16 text-center space-y-4 shadow-xs flex flex-col items-center">
                    <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-700">لا توجد ثـقافة مطابقة للبحث!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      لم نتمكن من العثور على أي منتج يطابق معايير ومحددات الفلترة الحالية. يرجى تعديل ميزانيتك أو فئة العلامة وتجربة عبارات بحث مرنة أخرى.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-blue-600 text-white font-bold text-xs py-2 px-5.5 rounded-xl hover:bg-blue-700 transition"
                    >
                      إعادة ضبط جميع مصفيات البحث
                    </button>
                  </div>
                ) : (
                  // Grid List
                  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6" id="products-grid-view">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onProductClick={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
        )}
      </main>

      {/* Floating modular footer */}
      <Footer />

      {/* Cart Slider Drawer side overlay panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckoutClick={() => { 
          if (!user) {
            setIsCartOpen(false);
            setAuthMode('login');
            setIsAuthOpen(true);
          } else {
            setCurrentView('checkout');
            setIsCartOpen(false);
          }
        }}
      />

      {/* Suspense wrapper for lazy-loaded overlays */}
      <React.Suspense fallback={null}>
        {/* Authentication Login/Register dialog panel */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />

        {/* Product Details Full specs modal overlay */}
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {/* Full-Screen / Modal Order Tracking */}
        <OrderTrackingModal 
          isOpen={isTrackingOpen} 
          onClose={() => setIsTrackingOpen(false)} 
          onOpenAuth={() => { setIsAuthOpen(true); setAuthMode('login'); }}
        />
      </React.Suspense>

      {/* Floating Smart AI Chatbot Assistant */}
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Storefront />
    </StoreProvider>
  );
}
