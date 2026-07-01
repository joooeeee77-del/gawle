import React from 'react';
import { Truck, ShieldCheck, HeartHandshake, PhoneCall, Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-850 mt-16" dir="rtl" id="gawali-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quality trust badges banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800 mb-10 text-right">
          
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-800 text-blue-500 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">توصيل سريع وفوري</h4>
              <p className="text-[11px] text-slate-400 font-medium">نشحن لجميع محافظات جمهورية مصر العربية بموثوقية وأمان تام.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-800 text-blue-500 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">منتجات أصلية ١٠٠٪</h4>
              <p className="text-[11px] text-slate-400 font-medium">نضمن أن جميع الهواتف الذكية والسماعات والإكسسوارات أصلية ومضمونة.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-800 text-blue-500 rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">خدمة الدفع عند الاستلام</h4>
              <p className="text-[11px] text-slate-400 font-medium">تسوّق بكل راحة بال وادفع عند استلام طلبك ومراجعته عند باب منزلك.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-slate-800 text-blue-500 rounded-xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">دعم ومتابعة ٢٤/٧</h4>
              <p className="text-[11px] text-slate-400 font-medium">خط دعم ساخن دائم للرد على استفساراتكم عبر الواتساب لتأكيد شحنتكم.</p>
            </div>
          </div>

        </div>

        {/* Lower logo and links columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 text-right">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {storeSettings?.storeLogo && (storeSettings.storeLogo.startsWith('http') || storeSettings.storeLogo.startsWith('/') || storeSettings.storeLogo.startsWith('data:') || storeSettings.storeLogo.length > 50) ? (
                <img 
                  src={storeSettings.storeLogo} 
                  alt={storeSettings.storeName || "Logo"} 
                  className="w-8 h-8 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="bg-blue-600 text-white p-2 rounded-xl font-bold text-lg leading-none">
                  {storeSettings?.storeLogo || 'ج'}
                </div>
              )}
              <span className="text-xl font-extrabold text-white tracking-tight">
                {storeSettings?.storeName || 'متجر جوالي'}<span className="text-blue-500 font-black">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              {storeSettings?.footerInformation || 'الوجهة المثالية الأولى لشراء أحدث الهواتف المحمولة الذكية، وإصدارات سماعات الأذن الملغية للضوضاء، وأغطية الحماية المعتمدة، والشواحن الأصلية الممتازة.'}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {storeSettings?.socialFacebook && (
                <a href={storeSettings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors" title="فيسبوك">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {storeSettings?.socialInstagram && (
                <a href={storeSettings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white rounded-lg transition-colors" title="إنستجرام">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeSettings?.socialTwitter && (
                <a href={storeSettings.socialTwitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-blue-400 text-slate-300 hover:text-white rounded-lg transition-colors" title="تويتر">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-white text-sm font-bold">الأقسام المتاحة بالمتجر</h4>
            <ul className="text-xs text-slate-400 space-y-2 font-semibold">
              <li>هواتف محمولة ذكية (موبايلات)</li>
              <li>سماعات رأسية وسماعات لاسلكية</li>
              <li>أغطية حماية وكفرات سيليكون</li>
              <li>منصات شحن لاسلكي وشواحن حائط</li>
              <li>إكسسوارات وحوامل مكاتب</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold">تواصل معنا</h4>
            <div className="text-xs text-slate-400 space-y-3 font-semibold">
              {storeSettings?.contactNumbers && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{storeSettings.contactNumbers}</span>
                </div>
              )}
              {storeSettings?.emailAddress && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{storeSettings.emailAddress}</span>
                </div>
              )}
              <p className="leading-relaxed mt-2 text-slate-400">
                ندعم الدفع نقدًا عند الاستلام، أو بالتحويل البنكي المباشر والمحافظ الإلكترونية (فودافون كاش، اتصالات كاش، أورنج كاش والمحافظ البنكية المختلفة).
              </p>
            </div>
          </div>

        </div>

        {/* Copyright disclaimer */}
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500 font-bold">
          <p>© {new Date().getFullYear()} {storeSettings?.storeName || 'متجر جوالي للاكترونيات'}. جميع الحقوق محفوظة.</p>
        </div>

      </div>
    </footer>
  );
};

