import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, Smartphone, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/utils';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  btnText: string;
  category: string;
  icon: React.ReactNode;
  badge: string;
}

interface HeroSliderProps {
  onCategorySelect: (catId: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onCategorySelect }) => {
  const [current, setCurrent] = useState(0);
  const { storeSettings } = useStore();

  const bannerImages = storeSettings?.homepageBanners && storeSettings.homepageBanners.length > 0 
    ? storeSettings.homepageBanners 
    : [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=95',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=95',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=95'
      ];

  const defaultSlidesData = [
    {
      badge: '✨ عروض وهدايا الصيف الحصرية',
      title: 'آيفون 15 برو ماكس بالتيتانيوم الفاخر',
      subtitle: 'أقوى هواتف آبل على الإطلاق بتصميم التيتانيوم الخفيف 📱',
      desc: 'احصل عليه الآن بضمان الوكيل الرسمي المعتمد في مصر مع شحن مجاني فوري لباب البيت وسرعة توصيل خيالية.',
      btnText: 'اكتشف هواتف آبل',
      category: 'mobiles',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      badge: '🤖 قوة الذكاء الاصطناعي الثورية',
      title: 'سامسونج جالكسي S24 ألترا الجديد',
      subtitle: 'عصر Galaxy AI قد بدأ رسمياً لتسهيل حياتك وتصويرك ✨',
      desc: 'قلم S-Pen مدمج، شاشة مسطحة بمقاومة غير مسبوقة للإنعكاسات، وكاميرا 200 ميجابكسل تقرب لك المستحيل.',
      btnText: 'تصفح هواتف سامسونج',
      category: 'mobiles',
      icon: <Smartphone className="w-5 h-5" />
    },
    {
      badge: '🎧 نقاء صوتي استثنائي حقيقي',
      title: 'سماعات الرأس وعزل الضوضاء النشط',
      subtitle: 'استمع لأدق التفاصيل الموسيقية والصوتية بنقاء سينمائي غامر 🔊',
      desc: 'تشكيلة ممتازة من آبل وبوز وجي بي إل بأفضل الأسعار وبضمان استرجاع مرن متكامل.',
      btnText: 'استكشف عالم الصوتيات',
      category: 'headphones',
      icon: <Headphones className="w-5 h-5" />
    }
  ];

  const slides: Slide[] = bannerImages.map((imgUrl, idx) => {
    const data = defaultSlidesData[idx % defaultSlidesData.length];
    return {
      id: idx + 1,
      badge: data.badge,
      title: data.title,
      subtitle: idx >= defaultSlidesData.length ? `${storeSettings?.storeName || 'عروض متجرنا'} الحصرية` : data.subtitle,
      desc: data.desc,
      image: imgUrl,
      btnText: data.btnText,
      category: data.category,
      icon: data.icon
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-brand-dark rounded-2xl h-[450px] sm:h-[500px] lg:h-[550px] border-2 border-brand-dark shadow-lg group" id="premium-hero-slideshow">
      {/* Geometric grid overlay pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={getOptimizedImageUrl(slides[current].image, 1200, 80)}
            alt={slides[current].title}
            className="w-full h-full object-cover filter brightness-50 contrast-110"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      {/* Modernist Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-l from-brand-dark via-brand-dark/30 to-transparent pointer-events-none" />

      {/* Slide Content Display */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 text-white z-10 text-right select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl space-y-4 sm:space-y-5"
          >
            {/* Slide Badge */}
            <span className="inline-flex items-center gap-1.5 bg-brand-blue/20 border border-brand-blue/30 text-blue-300 text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-md uppercase tracking-wider shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span>{slides[current].badge}</span>
            </span>

            {/* Slide Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {slides[current].title}
            </h1>

            {/* Slide Subtitle */}
            <p className="text-sm sm:text-lg text-slate-100 font-extrabold max-w-xl leading-relaxed">
              {slides[current].subtitle}
            </p>

            {/* Slide Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed opacity-90 hidden sm:block">
              {slides[current].desc}
            </p>

            {/* Slide Actions */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => onCategorySelect(slides[current].category)}
                className="bg-brand-blue hover:bg-white hover:text-brand-dark text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-lg transition duration-300 cursor-pointer shadow-lg shadow-brand-blue/20 active:scale-95 flex items-center gap-2 border border-brand-blue"
              >
                {slides[current].icon}
                <span>{slides[current].btnText}</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-brand-dark/60 hover:bg-brand-blue text-white rounded-md border border-white/10 backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-20"
        title="السابق"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-brand-dark/60 hover:bg-brand-blue text-white rounded-md border border-white/10 backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-20"
        title="التالي"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-none transition-all duration-300 cursor-pointer ${
              current === idx ? 'w-6 bg-brand-blue' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            title={`شريحة رقم ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
