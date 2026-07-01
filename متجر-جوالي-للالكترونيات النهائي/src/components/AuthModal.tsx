import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, MapPin, KeyRound, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, loginWithGoogle } = useStore();
  const [isLoginView, setIsLoginView] = useState(initialMode === 'login');

  // Field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setIsLoginView(initialMode === 'login');
      setErrorText('');
      setSuccessText('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    setLoading(true);

    try {
      if (isLoginView) {
        // Log in
        const res = await login(email, password);
        if (res.success) {
          if (res.role === 'admin') {
            setSuccessText('تم تسجيل دخولك كأدمن للنظام بنجاح!');
          } else {
            setSuccessText('أهلاً بك! تم تسجيل الدخول بنجاح.');
          }
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setErrorText(res.error || 'فشل تسجيل الدخول. يرجى مراجعة البيانات.');
        }
      } else {
        // Registrations
        if (!email || !name || !password || !phone.trim()) {
          setErrorText('يرجى كتابة البريد الإلكتروني، الاسم الكامل، كلمة المرور، ورقم الهاتف لقيد الحساب.');
          setLoading(false);
          return;
        }
        const cleanPhone = phone.trim().replace(/\D/g, '');
        if (cleanPhone.length !== 11) {
          setErrorText('رقم الهاتف غير صحيح. يجب أن يتكون رقم الهاتف من 11 رقماً بالضبط (مثال: 01012345678).');
          setLoading(false);
          return;
        }
        const res = await register(email, password, name, phone, address);
        if (res.success) {
          setSuccessText('تم إنشاء حسابك الجديد وتسجيل دخولك بنجاح!');
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setErrorText(res.error || 'فشل إنشاء الحساب.');
        }
      }
    } catch (err) {
      setErrorText('حدث خطأ غير متوقع، يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="auth-modal-overlay">
      {/* Blurred background backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Main Dialog panel modal */}
      <div 
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
        id="auth-modal-container"
      >
        {/* Close Button Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content top visual banner block */}
        <div className="bg-blue-600 text-white p-6 text-center space-y-2 relative">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-1">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">جوالـي للـإلكترونيات</h2>
          <p className="text-xs text-blue-100 font-medium">
            {isLoginView ? 'سجل دخولك لمتابعة شحناتك وتوسعة سلتك المشتراة' : 'أنشئ حساباً جديداً اليوم لتحصل على العروض والتخفيضات'}
          </p>
        </div>

        {/* Form area body */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Success and Error Indicators */}
            {errorText && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100">
                {errorText}
              </div>
            )}
            {successText && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-4 h-4" />
                <span>{successText}</span>
              </div>
            )}

            {/* If Login View */}
            {isLoginView ? (
              <>
                {/* Email field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </>
            ) : (
              // If Registration View
              <>
                {/* Full name input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">الاسم الكامل *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: أحمد عبد الله"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Email address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">البريد الإلكتروني *</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Phone details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">رقم الهاتف *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="مثال: 01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                      required
                    />
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Shipping address details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">عنوان التوصيل المعتمد (اختياري)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="المدينة، الحي والشارع بالتحديد"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-hidden text-right"
                    />
                    <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            {/* Action submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 text-xs rounded-xl transition duration-250 flex items-center justify-center gap-1.5"
              id="submit-auth-button"
            >
              <span>{loading ? 'جاري التحميل...' : isLoginView ? 'تسجيل الدخول' : 'إنشاء وتفعيل الحساب'}</span>
            </button>

            {/* Google Authentication Button */}
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setErrorText('');
                setSuccessText('');
                try {
                  const res = await loginWithGoogle();
                  if (res.success) {
                    setSuccessText('تم تسجيل الدخول الآمن بجوجل بنجاح! 🚀');
                    setTimeout(() => onClose(), 1200);
                  } else {
                    setErrorText(res.error || 'فشل تسجيل الدخول بجوجل.');
                  }
                } catch {
                  setErrorText('حدث خطأ أثناء الاتصال بجوجل.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-2.5 text-xs rounded-xl transition duration-200 flex items-center justify-center gap-1.5 border border-slate-200 mt-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>تسجيل الدخول بواسطة Google</span>
            </button>
          </form>

          {/* Quick toggle view linkage */}
          <div className="text-center font-bold text-xs text-slate-500">
            {isLoginView ? (
              <span>
                ليس لديك حساب بعد؟{' '}
                <button
                  onClick={() => setIsLoginView(false)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  أنشئ حساباً جديداً
                </button>
              </span>
            ) : (
              <span>
                لديك حساب بالفعل؟{' '}
                <button
                  onClick={() => setIsLoginView(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  تسجيل الدخول مباشرة
                </button>
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
