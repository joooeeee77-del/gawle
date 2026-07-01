import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Phone, MapPin, User as UserIcon, Keyboard, ShoppingBag, Landmark, ArrowRight, Sparkles, X, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

// XSS/HTML Injection Sanitization Utility
const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim();
};

interface Governorate {
  code: string;
  name: string;
  shippingFee: number;
  deliveryTime: string;
}

const EGYPT_GOVERNORATES: Governorate[] = [
  { code: 'EG-CAI', name: 'القاهرة', shippingFee: 65, deliveryTime: '24 - 48 ساعة' },
  { code: 'EG-GIZ', name: 'الجيزة', shippingFee: 65, deliveryTime: '24 - 48 ساعة' },
  { code: 'EG-QAL', name: 'القليوبية', shippingFee: 70, deliveryTime: '24 - 48 ساعة' },
  { code: 'EG-ALX', name: 'الإسكندرية', shippingFee: 75, deliveryTime: '24 - 48 ساعة' },
  { code: 'EG-MNF', name: 'المنوفية', shippingFee: 80, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-GHR', name: 'الغربية', shippingFee: 80, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-DKH', name: 'الدقهلية', shippingFee: 80, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-SHR', name: 'الشرقية', shippingFee: 80, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-BHR', name: 'البحيرة', shippingFee: 80, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-DAM', name: 'دمياط', shippingFee: 85, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-KFS', name: 'كفر الشيخ', shippingFee: 85, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-PSD', name: 'بورسعيد', shippingFee: 85, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-ISM', name: 'الإسماعيلية', shippingFee: 85, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-SUE', name: 'السويس', shippingFee: 85, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-FYM', name: 'الفيوم', shippingFee: 90, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-BNS', name: 'بني سويف', shippingFee: 90, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-MIN', name: 'المنيا', shippingFee: 95, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-ASY', name: 'أسيوط', shippingFee: 100, deliveryTime: '48 - 72 ساعة' },
  { code: 'EG-SHG', name: 'سوهاج', shippingFee: 105, deliveryTime: '3 - 4 أيام' },
  { code: 'EG-QNA', name: 'قنا', shippingFee: 110, deliveryTime: '3 - 4 أيام' },
  { code: 'EG-LXR', name: 'الأقصر', shippingFee: 115, deliveryTime: '3 - 5 أيام' },
  { code: 'EG-ASW', name: 'أسوان', shippingFee: 120, deliveryTime: '3 - 5 أيام' },
  { code: 'EG-RED', name: 'البحر الأحمر (الغردقة)', shippingFee: 125, deliveryTime: '3 - 5 أيام' },
  { code: 'EG-MAT', name: 'مطروح', shippingFee: 135, deliveryTime: '4 - 6 أيام' },
  { code: 'EG-JS', name: 'جنوب سيناء', shippingFee: 135, deliveryTime: '4 - 6 أيام' },
  { code: 'EG-NS', name: 'شمال سيناء', shippingFee: 145, deliveryTime: 'يخضع للظروف الأمنية' },
  { code: 'EG-WAD', name: 'الوادي الجديد', shippingFee: 145, deliveryTime: '5 - 7 أيام' },
];

interface CheckoutSectionProps {
  onBackToStore: () => void;
  onOpenAuth?: () => void;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({ onBackToStore, onOpenAuth }) => {
  const { cart, user, placeOrder, storeSettings } = useStore();

  const governoratesList = (storeSettings?.shippingFees && storeSettings.shippingFees.length > 0)
    ? storeSettings.shippingFees
    : EGYPT_GOVERNORATES;

  const availablePaymentMethods = storeSettings?.paymentMethods || ['cod', 'bank_transfer'];

  // Form Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGovCode, setSelectedGovCode] = useState('EG-CAI');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [note, setNote] = useState('');

  const [formError, setFormError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback to first available payment method if current is not available
  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.includes(paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0]);
    }
  }, [availablePaymentMethods]);

  // Prepopulate if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!user && !placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6" dir="rtl" id="checkout-auth-required">
        <div className="bg-amber-50 text-amber-600 p-4 rounded-full inline-block animate-pulse mb-2">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">يجب تسجيل الدخول أولاً!</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          عذراً، لا يمكنك إتمام عملية الشراء وتأكيد طلبك إلا بعد تسجيل الدخول أو إنشاء حساب جديد في المتجر لتتمكن من متابعة حالة طلبك وتأكيد بيانات الشحن.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={onOpenAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-8 rounded-xl transition shadow-md shadow-blue-100 cursor-pointer"
          >
            تسجيل الدخول / إنشاء حساب جديد
          </button>
          <button
            onClick={onBackToStore}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-6 rounded-xl transition cursor-pointer"
          >
            العودة لمواصلة التسوق
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4" dir="rtl">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-full inline-block animate-bounce mb-2">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">سلة الشراء فارغة حالياً!</h2>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          لا يوجد لديك أي منتجات في السلة لتأكيد طلب شرائها. عد للمتجر وأضف منتجات قبل المتابعة.
        </p>
        <button
          onClick={onBackToStore}
          className="bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:bg-blue-700 transition"
        >
          عودة إلى المتجر
        </button>
      </div>
    );
  }

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currentGov = governoratesList.find(g => g.code === selectedGovCode) || governoratesList[0];
  const shippingFee = currentGov.shippingFee;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!name.trim()) return setFormError('يرجى كتابة الاسم الكامل.');
    if (!phone.trim()) return setFormError('يرجى كتابة رقم الجوال للتواصل.');
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      return setFormError('رقم الجوال غير صحيح. يجب أن يتكون رقم الهاتف من 11 رقماً بالضبط (مثال: 01012345678).');
    }
    if (!address.trim()) return setFormError('يرجى كتابة عنوان وتفاصيل التوصيل بوضوح.');
    
    // Email is optional, but if entered it must be valid
    if (email.trim() && !email.includes('@')) {
      return setFormError('الرجاء إدخال بريد إلكتروني صالح يحتوي على علامة @ أو تركه فارغاً.');
    }

    setIsSubmitting(true);
    try {
      const fullAddress = `${currentGov.name} - ${sanitizeInput(address)}`;
      const fullNote = note.trim() 
        ? `${sanitizeInput(note)} (زمن التوصيل المتوقع: ${currentGov.deliveryTime})`
        : `زمن التوصيل المتوقع: ${currentGov.deliveryTime}`;

      const order = await placeOrder({
        customerName: sanitizeInput(name),
        customerEmail: email.trim() ? sanitizeInput(email) : 'guest@gawali.store',
        customerPhone: sanitizeInput(phone),
        deliveryAddress: fullAddress,
        paymentMethod,
        note: fullNote,
        shippingFee: shippingFee,
      });
      setPlacedOrder(order);
    } catch (err: any) {
      setFormError('حدث خطأ أثناء إتمام الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-blue-100 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 relative" dir="rtl" id="checkout-success-view">
        {/* Absolute Top corner Close (X) button */}
        <button
          onClick={onBackToStore}
          className="absolute top-4 left-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2.5 rounded-full cursor-pointer transition-colors"
          title="إغلاق والعودة للمتجر"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex bg-emerald-50 text-emerald-600 p-5 rounded-full ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <p className="text-emerald-700 font-extrabold text-xs tracking-wide bg-emerald-50 py-1.5 px-4 rounded-full w-fit mx-auto">
            ✓ تم استلام طلبك بنجاح!
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
            رقم طلبك: <span className="text-blue-600">#{placedOrder.id}</span>
          </h2>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
            ألف مبروك! لقد تم إنشاء الطلب وإرساله إلى نظام متجر جوالي. سيتواصل معك ممثل خدمة عملائنا عبر الهاتف لتأكيد شحن طلبك قريباً جداً.
          </p>
        </div>

        {/* Order Details box */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-200/50 pb-2.5">تفاصيل الشحن والتوصيل</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-600">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>المستلم: <span className="text-slate-800 font-bold">{placedOrder.customerName}</span></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>رقم الجوال: <span className="text-slate-800 font-bold">{placedOrder.customerPhone}</span></span>
            </div>
            <div className="sm:col-span-2 flex items-start gap-2 text-slate-600">
              <MapPin className="w-4.5 h-4.5 text-slate-400 mt-0.5" />
              <span>العنوان بالتفصيل: <span className="text-slate-800 font-bold">{placedOrder.deliveryAddress}</span></span>
            </div>
            {placedOrder.note && (
              <div className="sm:col-span-2 flex items-start gap-2 text-slate-600 border-t border-slate-200/30 pt-2.5">
                <Keyboard className="w-4 h-4 text-slate-400 mt-0.5" />
                <span>ملاحظات الطلب والتوصيل: <span className="text-slate-800 font-bold">{placedOrder.note}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Complete summary table */}
        <div className="space-y-3.5 text-xs font-semibold py-2">
          <div className="flex justify-between text-slate-500">
            <span>طريقة الدفع المختارة:</span>
            <span className="font-bold text-slate-800 bg-slate-100 py-1 px-3 rounded-full text-[11px]">
              الدفع عند الاستلام (مجاناً)
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-black border-t border-slate-100 pt-3 text-slate-800">
            <span>إجمالي الفاتورة المدفوع:</span>
            <span className="text-lg text-blue-600 font-black">{placedOrder.totalPrice.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>

        {/* Action Buttons to go back - extremely visible and styled */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onBackToStore}
            className="bg-blue-600 text-white font-black py-4 px-8 rounded-2xl text-sm hover:bg-blue-700 shadow-lg hover:shadow-blue-200 active:scale-98 transition-all flex-grow text-center cursor-pointer flex items-center justify-center gap-2"
            id="back-to-store-primary"
          >
            <span>العودة للرئيسية وتصفح المنتجات الآن</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onBackToStore}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl text-xs active:scale-98 transition-all text-center cursor-pointer"
            id="back-to-store-secondary"
          >
            إغلاق هذه الصفحة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl" id="checkout-form-section">
      {/* Header back navigation */}
      <button
        onClick={onBackToStore}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs mb-6 cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للمتجر</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left column: Information forms input */}
        <form onSubmit={handleSubmit} className="w-full lg:w-3/5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
            <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>تفاصيل التوصيل والشحن</span>
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name input field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>الاسم الكامل <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: أحمد محمد علي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right placeholder:text-slate-400/80 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>رقم الموبايل لتأكيد الشحن <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    placeholder="مثال: 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right placeholder:text-slate-400/80 font-medium"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>البريد الإلكتروني <span className="text-slate-400 font-semibold">(اختياري)</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="مثال: name@domain.com (اختياري)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right placeholder:text-slate-400/80 font-medium"
                  />
                </div>
              </div>

              {/* Governorate Selection Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>المحافظة بمصر <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={selectedGovCode}
                    onChange={(e) => setSelectedGovCode(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right font-semibold text-slate-800 appearance-none cursor-pointer pr-10 pl-4"
                    required
                  >
                    {governoratesList.map((gov) => (
                      <option key={gov.code} value={gov.code}>
                        {gov.name} ({gov.shippingFee} ج.م)
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {/* Dynamically display expected delivery time and shipping fee */}
                <div className="flex flex-col sm:flex-row justify-between gap-2 bg-blue-50/50 border border-blue-100 rounded-xl p-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                    <span>زمن التوصيل المتوقع:</span>
                    <span className="bg-blue-100/80 px-2 py-0.5 rounded text-blue-800">{currentGov.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                    <span>سعر الشحن للمحافظة:</span>
                    <span className="bg-blue-100/80 px-2 py-0.5 rounded text-blue-800">{currentGov.shippingFee} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Complete delivery Address description details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>عنوان التوصيل بالتفصيل بمصر <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: المعادي - شارع 9 - عمارة 12 شقة 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right placeholder:text-slate-400/80 font-medium"
                  required
                />
              </div>

              {/* Extra Delivery note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-blue-600" />
                  <span>ملاحظات خاصة بالتوصيل (اختياري)</span>
                </label>
                <textarea
                  placeholder="مثال: موعد التوصيل المفضل بعد العصر، أو الاتفاق مع الـحارس..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white text-right placeholder:text-slate-400/80 font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment selector widgets */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">طريقة الدفع المتاحة</h2>
            <div className="grid grid-cols-1 gap-4">
              <div
                className="border border-emerald-500 rounded-2xl p-5 flex items-start gap-4 bg-emerald-50/20 shadow-xs text-right"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span>الدفع عند الاستلام فقط (COD)</span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">مفعّل حالياً</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    الدفع نقدًا عند فحص واستلام شحنتك بباب المنزل لضمان كامل للمصداقية والأمان. لا توجد أي رسوم إضافية مضافة على هذه الخدمة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right column: Cart overview billing details list */}
        <div className="w-full lg:w-2/5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">ملخص طلب الشراء</h3>
            
            {/* List of checkout items */}
            <div className="max-h-[220px] overflow-y-auto space-y-3.5 pr-0.5">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 justify-between items-center text-xs">
                  <div className="flex gap-2.5 items-center">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-9 h-9 rounded bg-slate-50 border object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold text-slate-800 truncate max-w-[150px]">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 font-sans">{(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م</span>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>المجموع الفرعي للمنتجات:</span>
                <span className="text-slate-800 font-sans">{subtotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>رسوم شحن ({currentGov.name}):</span>
                <span className="text-slate-800 font-sans">{shippingFee.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-500 border-t border-dashed border-slate-100 pt-2">
                <span>زمن التوصيل المتوقع:</span>
                <span className="text-blue-600 font-bold">{currentGov.deliveryTime}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm font-black border-t border-slate-100 pt-3 text-slate-800">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="text-xl text-blue-600 font-black font-sans">{total.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full cursor-pointer bg-blue-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition-all ${
                  isSubmitting ? 'opacity-80 cursor-wait' : ''
                }`}
                id="submit-order-form-button"
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>{isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد وإتمام طلب الشراء الآن'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
