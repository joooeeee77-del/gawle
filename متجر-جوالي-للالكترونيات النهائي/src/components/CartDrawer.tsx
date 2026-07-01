import React from 'react';
import { X, Trash2, ShoppingBag, Truck, Lock, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutClick: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckoutClick }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, products } = useStore();

  if (!isOpen) return null;

  // Total Math calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 0; // Free shipping as requested
  const total = subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Dimmed backdrop background */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Cart Slider Panel */}
      <div 
        className="absolute inset-y-0 left-0 max-w-md w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300"
        dir="rtl"
        id="cart-drawer-container"
      >
        {/* Draw Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-800">سلة المشتريات</h2>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Notice */}
        {cart.length > 0 && (
          <div className="bg-blue-50/80 px-5 py-3 border-b border-blue-100/50 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs text-slate-700 font-bold">
              توصيل سريع ومضمون لجميع المحافظات خلال ٢٤-٤٨ ساعة فقط!
            </div>
          </div>
        )}

        {/* Cart items list / empty layout */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="bg-slate-50 p-6 rounded-full inline-block">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-base font-extrabold text-slate-700">سلتك لا تزال فارغة!</h3>
              <p className="text-xs text-slate-400 max-w-[240px]">
                تصفح أقسامنا الـمختلفة الآن وأضف أحدث الموبايلات وإصدارات سماعات السبيكر وإكسسوارات الجوال.
              </p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                ابدأ الـتسوق الآن
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const liveProduct = products.find((p) => p.id === item.product.id);
              const maxStock = liveProduct ? liveProduct.stock : item.product.stock;
              const isAtMaxStock = item.quantity >= maxStock;

              return (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100 relative group"
                  id={`cart-item-${item.product.id}`}
                >
                  {/* Image */}
                  <div className="w-18 h-18 bg-white rounded-lg border overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info Text */}
                  <div className="flex-grow flex flex-col justify-between text-right">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 pr-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[10px] text-blue-600 font-semibold mb-1 block">
                        {item.product.brand}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Size and Quantities */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden size-sm">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={isAtMaxStock}
                          className={`px-2 py-0.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-sm cursor-pointer select-none ${
                            isAtMaxStock ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''
                          }`}
                          title={isAtMaxStock ? 'أقصى كمية متوفرة بالمخزون' : 'زيادة'}
                        >
                          +
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800 select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 transition-colors font-bold text-sm cursor-pointer select-none"
                        >
                          -
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-black text-slate-900 leading-none">
                        {(item.product.price * item.quantity).toLocaleString('ar-EG')}{' '}
                        <span className="text-[10px] font-bold text-slate-400">ج.م</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Delete button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute left-2.5 top-2.5 text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md cursor-pointer"
                    title="حذف من السلة"
                    id={`remove-cart-item-${item.product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Footer totals checklist & Call to action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/80 space-y-4">
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-slate-700">
                  {subtotal.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200/50 pb-2.5">
                <span>تكلفة الشحن والتوصيل:</span>
                <span className="font-bold text-emerald-600">
                  مجاني بمناسبة الافتتاح
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-black text-slate-800">الإجمالي الكلي:</span>
                <span className="text-xl font-black text-blue-600">
                  {total.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={clearCart}
                className="bg-slate-100 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-200/80 p-3 rounded-xl transition-colors cursor-pointer"
                title="تفريغ السلة تماماً"
                id="empty-cart-button"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onCheckoutClick();
                }}
                className="flex-grow bg-blue-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
                id="checkout-trigger-button"
              >
                <Lock className="w-4 h-4" />
                <span>الذهاب لتأكيد طلب الشراء</span>
                <ArrowLeft className="w-4 h-4 mr-auto animate-pulse" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
