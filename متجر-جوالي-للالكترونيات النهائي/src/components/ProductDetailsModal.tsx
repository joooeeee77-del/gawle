import React, { useState } from 'react';
import { X, Star, ShoppingCart, Info, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl } from '../lib/utils';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart, cart } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const remainingAvailable = Math.max(0, product.stock - cartQty);
  const isOutOfStock = product.stock <= 0 || remainingAvailable <= 0;

  const handleAddToCart = () => {
    if (remainingAvailable <= 0) return;
    const finalQty = Math.min(remainingAvailable, quantity);
    addToCart(product, finalQty);
    // Reset quantity after adding
    setQuantity(1);
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mobiles':
        return 'موبايلات (هواتف محمولة)';
      case 'headphones':
        return 'سماعات';
      case 'watches':
        return 'ساعات ذكية';
      case 'covers':
        return 'أغطية حماية';
      case 'chargers':
        return 'شواحن وكابلات شحن';
      case 'accessories':
        return 'إكسسوارات إضافية';
      default:
        return category;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10" id="product-details-modal-overlay">
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card content wrapper */}
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-200" 
        dir="rtl"
        id="product-details-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images View Stage (Dynamic Switcher) */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-center items-center relative border-l border-slate-100 select-none">
          <div className="w-full max-w-[340px] aspect-square relative bg-white rounded-2xl shadow-xs overflow-hidden leading-none flex items-center justify-center p-4">
            <img
              src={getOptimizedImageUrl(product.images[activeImageIndex] || product.images[0], 800, 80)}
              alt={product.name}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Multiple Image Selector thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto w-full max-w-[340px] justify-center py-1">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg bg-white border overflow-hidden shrink-0 cursor-pointer transition-all p-1 flex items-center justify-center ${
                    idx === activeImageIndex
                      ? 'border-blue-600 ring-2 ring-blue-600/10 scale-105'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={getOptimizedImageUrl(imgUrl, 150, 75)} alt={`${product.name} - ${idx}`} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Detailed specs & action layout */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
          {/* Brand & Category tags */}
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
              {product.brand}
            </span>
            <span className="text-slate-400 text-xs font-semibold">
              {getCategoryLabel(product.category)}
            </span>
            {product.condition && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md shadow-2xs ${
                product.condition === 'new'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {product.condition === 'new' ? 'الحالة: جديد' : 'الحالة: مستعمل'}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug mb-3">
            {product.name}
          </h2>

          {/* Star ratings */}
          <div className="flex items-center gap-1.5 text-amber-400 mb-4 bg-amber-50/50 py-1.5 px-3 rounded-lg w-fit text-xs font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="text-slate-700">{product.rating} من ٥ تقييمات العملاء</span>
          </div>

          {/* Price Tag */}
          <div className="bg-slate-50/80 p-4 rounded-xl mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">السعر الفعلي</span>
              <span className="text-2xl font-black text-slate-900 font-sans">
                {product.price.toLocaleString('ar-EG')} <span className="text-sm font-black text-slate-500 font-sans">ج.م</span>
              </span>
            </div>

            <div className="text-left">
              {product.stock > 0 ? (
                <span className="text-blue-600 text-xs font-bold px-3 py-1 rounded-full bg-blue-50/50 border border-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>متوفر: {product.stock} وحدات</span>
                </span>
              ) : (
                <span className="text-red-500 text-xs font-bold px-3 py-1 rounded-full bg-red-50 border border-red-100">
                  غير متوفر حالياً
                </span>
              )}
            </div>
          </div>

          {/* Product Description text */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-blue-600" />
              <span>وصف المنتج</span>
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Product Specs attributes */}
          {Object.keys(product.specs).length > 0 && (
            <div className="mb-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-3">المواصفات الفنية</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start text-xs border-b border-dashed border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500 font-semibold">{key}:</span>
                    <span className="text-slate-800 font-bold max-w-[70%] text-left">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            {cartQty > 0 && (
              <div className="text-right text-[11px] font-bold text-blue-600 mb-2">
                لديك بالفعل {cartQty} {cartQty === 1 ? 'وحدة' : 'وحدات'} في سلة الشراء. المتبقي المتاح للشراء: {remainingAvailable} {remainingAvailable === 1 ? 'وحدة' : 'وحدات'}
              </div>
            )}
            
            <div className="flex items-center gap-3.5">
              {/* Quantity Controls */}
              {!isOutOfStock && (
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(remainingAvailable, q + 1))}
                    className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-lg select-none cursor-pointer"
                  >
                    +
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800 text-sm select-none">
                    {Math.min(remainingAvailable, quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-lg select-none cursor-pointer"
                  >
                    -
                  </button>
                </div>
              )}

              {/* Add to Cart Premium Action button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-grow cursor-pointer py-3 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-95'
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span>
                  {product.stock <= 0
                    ? 'نفد المخزون'
                    : remainingAvailable <= 0
                    ? 'الكمية بالكامل في السلة'
                    : 'أضف إلى سلة المشتريات'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
