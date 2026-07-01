import React from 'react';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onProductClick: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onProductClick }) => {
  const { addToCart } = useStore();

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mobiles':
        return 'موبايل';
      case 'headphones':
        return 'سماعة';
      case 'watches':
        return 'ساعة ذكية';
      case 'covers':
        return 'غطاء حماية';
      case 'chargers':
        return 'شاحن شحن';
      case 'accessories':
        return 'إكسسوار';
      default:
        return category;
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-xl border border-brand-dark/15 hover:border-brand-blue/30 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full relative" id={`product-card-${product.id}`}>
      {/* Product Image Stage */}
      <div className="relative pt-[100%] bg-brand-sand/15 overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
        <div className="absolute inset-0 p-3 flex items-center justify-center">
          <img
            src={getOptimizedImageUrl(product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=95', 400, 75)}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Category Badge & Condition Badge */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          <span className="bg-white/95 backdrop-blur-xs text-brand-dark text-[9px] font-black px-2 py-0.5 rounded-md border border-brand-dark/10 shadow-3xs uppercase tracking-wider">
            {getCategoryLabel(product.category)}
          </span>
          {product.condition && (
            <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-3xs border ${
              product.condition === 'new'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
            }`}>
              {product.condition === 'new' ? 'جديد' : 'مستعمل'}
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        {isOutOfStock ? (
          <span className="absolute bottom-2 left-2 bg-red-500/10 text-red-700 border border-red-500/20 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md">
            نفذت الكمية
          </span>
        ) : product.stock <= 3 ? (
          <span className="absolute bottom-2 left-2 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md">
            متبقي {product.stock} فقط!
          </span>
        ) : null}

        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-brand-dark text-white font-black px-3.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 shadow-md hover:bg-brand-blue transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-3 h-3 text-brand-cream" />
            <span>عرض سريع</span>
          </button>
        </div>
      </div>

      {/* Product Text details */}
      <div className="p-2 sm:p-3 flex flex-col flex-grow text-right">
        {/* Name - directly below image */}
        <h3
          onClick={() => onProductClick(product)}
          className="text-[11px] sm:text-xs md:text-sm font-bold text-brand-dark line-clamp-2 cursor-pointer hover:text-brand-blue mb-1 text-right transition-colors leading-snug min-h-[32px] sm:min-h-[40px] flex items-center justify-end"
        >
          {product.name}
        </h3>

        {/* Brand & Stars */}
        <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-400 mb-2">
          <span className="font-black text-brand-blue uppercase tracking-wider">{product.brand}</span>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
            <span className="font-bold text-slate-700 text-[9px] sm:text-[10px]">{product.rating}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 border-t border-brand-dark/10 flex items-center justify-between gap-1.5">
          <div className="flex flex-col text-right shrink-0">
            <span className="text-xs sm:text-sm md:text-base font-black text-brand-dark font-mono leading-none">
              {product.price.toLocaleString('ar-EG')} <span className="text-[9px] sm:text-[10px] font-bold text-slate-500">ج.م</span>
            </span>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className={`cursor-pointer px-1.5 sm:px-2.5 py-1 sm:py-2 rounded-lg text-[9px] sm:text-[11px] font-black flex items-center gap-1 transition-all outline-hidden ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-dark text-white hover:bg-brand-blue active:scale-95 shadow-sm'
            }`}
            title="أضف إلى السلة"
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden min-[360px]:inline">أضف للسلة</span>
          </button>
        </div>
      </div>
    </div>
  );
});
