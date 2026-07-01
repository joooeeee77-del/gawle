import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, X, Package, Clock, Truck, CheckCircle2, AlertTriangle, 
  ChevronLeft, Calendar, User, Phone, MapPin, Receipt, ArrowRight,
  ShieldCheck, HelpCircle, Eye, ShoppingCart, MessageCircle, RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

interface TimelineStep {
  title: string;
  state: 'completed' | 'active' | 'pending';
  desc: string;
  icon: React.ComponentType<any>;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, token } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Consolidated function to fetch tracking data from the server
  const fetchTrackingData = useCallback(async (queryStr: string, silent = false) => {
    const q = queryStr.trim();

    if (!silent) {
      setIsRefreshing(true);
    }

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFoundOrders(data);
          setSearched(true);

          if (data.length > 0) {
            // Update selected order with latest state
            setSelectedOrder((current) => {
              if (current) {
                const fresh = data.find(o => o.id === current.id);
                return fresh || data[0];
              }
              return data.length === 1 ? data[0] : null;
            });
          } else {
            setSelectedOrder(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch tracking details:', err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [token]);

  // 1. Setup default search query and fetch on open
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearched(false);
      setFoundOrders([]);
      setSelectedOrder(null);
      return;
    }

    if (user) {
      fetchTrackingData('');
    }
  }, [isOpen, user, fetchTrackingData]);

  // 2. Poll every 5 seconds for real-time tracking updates
  useEffect(() => {
    if (!isOpen || !user) return;

    const interval = setInterval(() => {
      fetchTrackingData(searchQuery, true); // silent refresh (no spinner flickering)
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, searchQuery, user, fetchTrackingData]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingData(searchQuery);
  };

  // State Machine logic to generate exactly what step status is
  const getTimelineSteps = (status: OrderStatus): TimelineStep[] => {
    const steps: TimelineStep[] = [];

    // 1. تأكيد الطلب
    let step1State: 'completed' | 'active' | 'pending' = 'completed';
    let step1Desc = 'تم تأكيد طلبك وقبوله بنجاح في النظام.';
    if (status === 'pending') {
      step1State = 'active';
      step1Desc = 'بانتظار مراجعة وتأكيد طلبك من قبل إدارة متجر جوالي.';
    }
    steps.push({ title: 'تأكيد الطلب', state: step1State, desc: step1Desc, icon: ShieldCheck });

    // 2. تجهيز الطلب
    let step2State: 'completed' | 'active' | 'pending' = 'completed';
    let step2Desc = 'تم تجهيز وتعبئة الأجهزة بالكامل وتغليفها بأمان مع الملحقات.';
    if (status === 'pending') {
      step2State = 'pending';
      step2Desc = 'بانتظار تأكيد الطلب أولاً للبدء في التجهيز الفني.';
    } else if (status === 'confirmed') {
      step2State = 'active';
      step2Desc = 'جاري الآن فحص الهواتف وتجهيزها وتغليفها بعناية فائقة.';
    }
    steps.push({ title: 'تجهيز الطلب في المستودع', state: step2State, desc: step2Desc, icon: Package });

    // 3. جاهز للشحن
    let step3State: 'completed' | 'active' | 'pending' = 'completed';
    let step3Desc = 'الطلب جاهز تماماً وتم حجز الشحنة وتسليمها لقسم التوصيل.';
    if (status === 'pending' || status === 'confirmed') {
      step3State = 'pending';
      step3Desc = 'بانتظار تجهيز وتعبئة المنتجات أولاً.';
    } else if (status === 'preparing') {
      step3State = 'active';
      step3Desc = 'جاري وضع ملصقات الشحن وتجهيز الطرد للاستلام.';
    }
    steps.push({ title: 'جاهز للتوصيل / الشحن', state: step3State, desc: step3Desc, icon: Clock });

    // 4. تم الشحن
    let step4State: 'completed' | 'active' | 'pending' = 'completed';
    let step4Desc = 'تم تسليم الشحنة للمندوب وهي الآن في طريقها لمدينتك.';
    if (status === 'pending' || status === 'confirmed' || status === 'preparing') {
      step4State = 'pending';
      step4Desc = 'بانتظار تجهيز وتسليم الشحنة لشركة الشحن.';
    } else if (status === 'ready_to_ship') {
      step4State = 'active';
      step4Desc = 'بانتظار استلام مندوب التوصيل المعتمد لطلبك.';
    }
    steps.push({ title: 'تم الشحن والتسليم للمندوب', state: step4State, desc: step4Desc, icon: Truck });

    // 5. خارج للتوصيل
    let step5State: 'completed' | 'active' | 'pending' = 'completed';
    let step5Desc = 'تم التوصيل بنجاح لعنوان العميل.';
    if (status === 'pending' || status === 'confirmed' || status === 'preparing' || status === 'ready_to_ship') {
      step5State = 'pending';
      step5Desc = 'بانتظار تسليم الشحنة لشركة التوصيل أولاً.';
    } else if (status === 'shipped') {
      step5State = 'active';
      step5Desc = 'بانتظار بدء التوصيل لعنوانك المكتوب في الفاتورة.';
    } else if (status === 'out_for_delivery') {
      step5State = 'active';
      step5Desc = '🛵 الشحنة مع مندوب التوصيل الآن وفي طريقها لعنوانك اليوم! يرجى إبقاء الهاتف متاحاً.';
    }
    steps.push({ title: 'خارج للتوصيل الآن', state: step5State, desc: step5Desc, icon: Truck });

    // 6. تم التوصيل
    let step6State: 'completed' | 'active' | 'pending' = 'completed';
    let step6Desc = 'تم تسليم الشحنة بنجاح وسعادة! شكراً لثقتكم الغالية بمتجر جوالي 🎉';
    if (status !== 'delivered') {
      if (status === 'out_for_delivery') {
        step6State = 'active';
        step6Desc = 'بانتظار تأكيد الاستلام من قبل العميل.';
      } else {
        step6State = 'pending';
        step6Desc = 'بانتظار وصول الشحنة وإتمام التوصيل.';
      }
    }
    steps.push({ title: 'تم التوصيل والاستلام', state: step6State, desc: step6Desc, icon: CheckCircle2 });

    return steps;
  };

  const getStatusLabelText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة والتدقيق';
      case 'confirmed': return 'تم تأكيد طلبك وجاري التجهيز';
      case 'preparing': return 'جاري التعبئة وفحص الجودة';
      case 'ready_to_ship': return 'شحنتك جاهزة وبانتظار المندوب';
      case 'shipped': return 'تم تسليمها للمندوب وهي في طريقها إليك';
      case 'out_for_delivery': return 'مع المندوب الآن - التوصيل اليوم 🛵';
      case 'delivered': return 'تم الاستلام بنجاح - شكراً لك 🎉';
      case 'cancelled': return 'تم إلغاء الطلب من الإدارة';
      default: return 'قيد المعالجة';
    }
  };

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'pending': 
        return { bg: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' };
      case 'confirmed': 
        return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', dot: 'bg-indigo-500' };
      case 'preparing': 
        return { bg: 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500' };
      case 'ready_to_ship': 
        return { bg: 'bg-purple-50 border-purple-200 text-purple-800', dot: 'bg-purple-500' };
      case 'shipped': 
        return { bg: 'bg-sky-50 border-sky-200 text-sky-800', dot: 'bg-sky-500' };
      case 'out_for_delivery': 
        return { bg: 'bg-pink-50 border-pink-200 text-pink-800', dot: 'bg-pink-500' };
      case 'delivered': 
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' };
      case 'cancelled': 
        return { bg: 'bg-red-50 border-red-200 text-red-800', dot: 'bg-red-500' };
      default: 
        return { bg: 'bg-slate-50 border-slate-200 text-slate-800', dot: 'bg-slate-500' };
    }
  };

  const getProgressPercentage = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 15;
      case 'confirmed': return 35;
      case 'preparing': return 50;
      case 'ready_to_ship': return 65;
      case 'shipped': return 80;
      case 'out_for_delivery': return 92;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 15;
    }
  };

  // Egyptian custom date formatting & delivery estimate helper
  const getDeliveryEstimate = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      // Delivery is estimated between 2 to 3 days from creation
      const estMin = new Date(date);
      estMin.setDate(date.getDate() + 2);
      const estMax = new Date(date);
      estMax.setDate(date.getDate() + 3);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return `بين ${estMin.toLocaleDateString('ar-EG', options)} و ${estMax.toLocaleDateString('ar-EG', options)}`;
    } catch {
      return 'خلال 48 إلى 72 ساعة عمل';
    }
  };

  // WhatsApp helper link creator
  const getWhatsAppLink = (phone: string, orderId?: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone;
    }
    const text = orderId 
      ? `مرحباً متجر جوالي، أود الاستفسار عن حالة طلبي رقم #${orderId} 📱`
      : `مرحباً متجر جوالي 📱`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" dir="rtl" id="order-tracking-modal">
      <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Modern Header */}
        <div className="p-4.5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </span>
              <span>مركز تتبع الشحنات الحي 📦</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold">تتبع فوري تلقائي لخطوات التوصيل</p>
              {user && (
                <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>يحدث كل 5 ثوانٍ</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 bg-slate-50 flex-grow py-16">
            <div className="p-5 bg-blue-50 text-blue-600 rounded-full animate-bounce duration-1000">
              <Package className="w-16 h-16 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-800">تتبع الشحنات متاح للأعضاء فقط 🔒</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                لحماية خصوصية طلباتك وشحناتك، يرجى تسجيل الدخول إلى حسابك أولاً لتصفح وتتبع طلبياتك الموثقة. لا يمكن تتبع الشحنات عشوائياً برقم الهاتف الخارجي.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-8 rounded-2xl transition-all shadow-md shadow-blue-200 active:scale-95 cursor-pointer"
            >
              تسجيل الدخول إلى حسابك الآن 🔑
            </button>
          </div>
        ) : (
          <>
            {/* Dynamic Search Box */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="أدخل كود طلبك الخاص للبحث السريع (مثال: order_123456)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl py-3 pr-11 pl-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-right shadow-inner"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 rounded-2xl transition-all shadow-md shadow-blue-200 active:scale-95 cursor-pointer shrink-0"
                >
                  ابحث
                </button>
              </form>
            </div>

            {/* Scrollable Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 bg-slate-50/50">
              {!searched ? (
                <div className="py-12 sm:py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
                  <div className="p-5 bg-blue-50/75 rounded-full text-blue-500 animate-pulse">
                    <Package className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-700">جاري جلب قائمة طلباتك الخاصة...</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm leading-relaxed">
                    نقوم بالاتصال بخوادمنا المحدثة لعرض شحناتك المخصصة. يمكنك أيضاً كتابة كود طلب محدد في مربع البحث أعلاه.
                  </p>
                </div>
              ) : foundOrders.length === 0 ? (
                <div className="py-12 sm:py-16 text-center text-red-500 flex flex-col items-center justify-center gap-4">
                  <div className="p-5 bg-red-50 rounded-full text-red-500">
                    <AlertTriangle className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-red-600">عذراً، لم نعثر على أي طلبات مطابقة في حسابك!</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 max-w-xs leading-relaxed">
                    يرجى التأكد من كتابة كود الفاتورة بشكل صحيح أو التحقق من قسم الشراء.
                  </p>
                </div>
              ) : !selectedOrder ? (
                /* Multi-orders list selector (Optimized for Mobile) */
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-slate-700 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <p className="text-xs font-black">وجدنا {foundOrders.length} طلبات مسجلة ببياناتك:</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {foundOrders.map((order) => {
                      const badge = getStatusBadgeStyles(order.status);
                      return (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="w-full text-right bg-white hover:bg-slate-50 border border-slate-150 hover:border-blue-300 p-4 rounded-2xl transition-all flex justify-between items-center group cursor-pointer shadow-3xs"
                        >
                          <div className="space-y-1.5 flex-1 pl-3 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-slate-900 group-hover:text-blue-600 transition-colors">#{order.id}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badge.bg} flex items-center gap-1`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                                {getStatusLabelText(order.status)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(order.createdAt).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 truncate max-w-xs">
                              {order.items.map(it => it.product.name).join(' ، ')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-800 font-sans">{order.totalPrice.toLocaleString('ar-EG')} ج.م</p>
                              <span className="text-[9px] text-blue-600 font-black flex items-center gap-0.5 justify-end mt-0.5">
                                تتبع <Eye className="w-2.5 h-2.5" />
                              </span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:translate-x-[-3px] transition-transform" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Selected Single Order Dashboard (Extremely polished and mobile-first) */
                <div className="space-y-4 sm:space-y-5">
              
              {/* Header Back button if multi-orders existed */}
              {foundOrders.length > 1 && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-[10px] text-slate-600 hover:text-slate-850 font-black flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer w-fit mb-2 shadow-3xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>الرجوع لكافة طلباتي ({foundOrders.length})</span>
                </button>
              )}

              {/* Order Metadata Sleek Panel */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-4.5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="absolute left-[-25px] bottom-[-25px] text-white/[0.03] pointer-events-none select-none">
                  <Receipt className="w-36 h-36" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-3.5 mb-3.5 gap-2.5">
                  <div className="min-w-0">
                    <span className="text-[9px] bg-white/10 py-0.5 px-2 rounded font-bold text-slate-300">رقم الفاتورة الموحد</span>
                    <h4 className="font-mono font-black text-xs sm:text-sm text-white mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-blue-300">#{selectedOrder.id}</span>
                      <span className="text-[9px] text-slate-400 font-sans">GW-TRK-{selectedOrder.id.split('_')[1] || selectedOrder.id}</span>
                    </h4>
                  </div>
                  <div className="text-right sm:text-left shrink-0">
                    <span className="text-[9px] bg-white/10 py-0.5 px-2 rounded font-bold text-slate-300">الإجمالي شامل التوصيل</span>
                    <h4 className="font-sans font-black text-sm sm:text-base text-emerald-400 mt-1">{selectedOrder.totalPrice.toLocaleString('ar-EG')} ج.م</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-bold text-slate-300">
                  <div className="flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400 shrink-0" /><span>الاسم: {selectedOrder.customerName}</span></div>
                  <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><span>الهاتف: {selectedOrder.customerPhone}</span></div>
                  <div className="flex items-start gap-1.5 col-span-1 sm:col-span-2 leading-relaxed min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="truncate">العنوان: {selectedOrder.deliveryAddress}</span>
                  </div>
                </div>

                {/* Estimate box if not cancelled or delivered */}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-blue-300">
                    <Calendar className="w-4 h-4 shrink-0 text-blue-400" />
                    <span>توصيل تقديري: {getDeliveryEstimate(selectedOrder.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar Component (Extremely Professional) */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-3 shadow-3xs">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      <span className="font-black text-slate-700">مستوى جاهزية الشحنة:</span>
                    </div>
                    <span className="font-black text-blue-600 font-sans text-xs sm:text-sm">{getProgressPercentage(selectedOrder.status)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 font-extrabold pt-0.5">
                    <span className={selectedOrder.status === 'pending' ? 'text-blue-600 font-black' : ''}>بانتظار التأكيد</span>
                    <span className={['preparing', 'ready_to_ship'].includes(selectedOrder.status) ? 'text-blue-600 font-black' : ''}>قيد التجهيز</span>
                    <span className={['shipped', 'out_for_delivery'].includes(selectedOrder.status) ? 'text-blue-600 font-black' : ''}>جاري التوصيل</span>
                    <span className={selectedOrder.status === 'delivered' ? 'text-emerald-600 font-black' : ''}>تم الاستلام 🎉</span>
                  </div>
                </div>
              )}

              {/* Progress Timeline Stepper or Cancel Banner */}
              {selectedOrder.status === 'cancelled' ? (
                <div className="p-5 bg-red-50 border border-red-150 rounded-2xl text-center text-red-700 font-black text-xs flex flex-col items-center justify-center gap-2.5 shadow-3xs">
                  <AlertTriangle className="w-9 h-9 text-red-500 shrink-0" />
                  <p className="font-black text-sm">تم إلغاء هذا الطلب</p>
                  <p className="text-[10px] text-slate-500 max-w-md font-semibold leading-relaxed">
                    تم إلغاء هذا الطلب من قبل الإدارة أو بناءً على رغبتكم. يرجى التواصل مع فريق الدعم للمساعدة وإعادة التفعيل.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800">تفاصيل المسار الزمني للشحنة:</h3>
                    <div className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>متصل بالنظام فوري</span>
                    </div>
                  </div>
                  
                  {/* Vertical Timeline - Highly Optimized for Mobile screen density */}
                  <div className="relative pr-5 mr-2.5 border-r border-slate-200 space-y-4">
                    {getTimelineSteps(selectedOrder.status).map((step, idx) => {
                      const StepIcon = step.icon;
                      
                      return (
                        <div key={idx} className="relative flex gap-3.5 items-start">
                          
                          {/* Dot Badge */}
                          <div 
                            className={`absolute right-[-25px] top-1.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${
                              step.state === 'completed'
                                ? 'bg-emerald-500 border-emerald-500 ring-4 ring-emerald-50 text-white' 
                                : step.state === 'active'
                                  ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-50 text-white' 
                                  : 'bg-white border-slate-200 text-slate-300'
                            }`}
                          >
                            {step.state === 'completed' && (
                              <span className="text-[8px] font-black">✔</span>
                            )}
                            {step.state === 'active' && (
                              <span className="text-[8px] font-black animate-pulse">⚡</span>
                            )}
                            {step.state === 'pending' && (
                              <span className="text-[8px] font-black"></span>
                            )}
                          </div>

                          {/* Step Card Box */}
                          <div className={`flex-1 p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${
                            step.state === 'active'
                              ? 'bg-blue-50/70 border-blue-200 shadow-2xs' 
                              : step.state === 'completed'
                                ? 'bg-white border-slate-150 opacity-90' 
                                : 'bg-white/40 border-slate-100 opacity-40'
                          }`}>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <div className={`p-1 rounded-lg ${
                                step.state === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : step.state === 'active' 
                                    ? 'bg-blue-100 text-blue-600 animate-pulse' 
                                    : 'bg-slate-100 text-slate-400'
                              }`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <h4 className={`text-[11px] sm:text-xs font-black ${
                                step.state === 'completed' 
                                  ? 'text-slate-800' 
                                  : step.state === 'active' 
                                    ? 'text-blue-900' 
                                    : 'text-slate-400'
                              }`}>{step.title}</h4>
                              
                              {step.state === 'active' && (
                                <span className="text-[8px] bg-blue-600 text-white py-0.5 px-2 rounded-full font-bold animate-pulse">الخطوة الحالية</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed pr-6 sm:pr-7">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Summary list */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-150 space-y-2.5 shadow-3xs">
                <span className="text-[10px] text-slate-400 font-black block">محتويات الطرد الفعلي:</span>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it) => (
                    <div key={it.product.id} className="flex justify-between items-center py-2 text-[11px] font-bold text-slate-700 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShoppingCart className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{it.product.name}</span>
                      </div>
                      <span className="text-slate-500 font-black font-sans shrink-0">عدد {it.quantity} × {it.product.price.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick support WhatsApp button inside tracking */}
              <div className="pt-1.5">
                <a
                  href={getWhatsAppLink('01000117260', selectedOrder.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-550 hover:bg-emerald-600 text-white text-xs font-black px-4.5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-100 text-center"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-white stroke-none" />
                  <span>استفسار فوري واتساب عن هذا الطلب</span>
                </a>
              </div>

            </div>
          )}
        </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
