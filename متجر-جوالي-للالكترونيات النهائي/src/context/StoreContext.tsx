import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, User, Order, OrderStatus, StoreSettings } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface StoreContextType {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  wishlist: string[];
  allUsers: User[];
  token: string | null;
  storeSettings: StoreSettings | null;
  updateStoreSettings: (newSettings: Omit<StoreSettings, 'id'>) => Promise<boolean>;
  toggleWishlist: (productId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: 'user' | 'admin' }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, phone: string, address: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: 'cod' | 'bank_transfer';
    note?: string;
    shippingFee?: number;
  }) => Promise<Order>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('gawali_user');
      if (stored && stored.trim() !== '') {
        const u = JSON.parse(stored);
        if (u) {
          const mappedId = u.id || u.uid;
          if (mappedId) {
            u.id = mappedId;
            u.uid = mappedId;
          }
        }
        return u;
      }
      return null;
    } catch (e) {
      console.error('Error loading gawali_user from storage:', e);
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [token, setToken] = useState<string | null>(() => {
    try {
      const storedToken = localStorage.getItem('gawali_token');
      if (storedToken && storedToken.trim() !== '') {
        return storedToken;
      }
      const stored = localStorage.getItem('gawali_user');
      if (stored && stored.trim() !== '') {
        const u = JSON.parse(stored);
        if (u.id === 'admin_1') return '7418520963mobile#_token';
        if (u.id === 'admin_joe' || u.email === 'joooeeee77@gmail.com') return 'joooeeee77@gmail.com_token';
        if (u.id) return 'custom_token_' + u.id;
      }
    } catch (e) {
      console.error('Error loading token from storage:', e);
    }
    return null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('gawali_cart');
      return stored && stored.trim() !== '' ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading gawali_cart from storage:', e);
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('gawali_orders');
      return stored && stored.trim() !== '' ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading gawali_orders from storage:', e);
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('gawali_wishlist');
      return stored && stored.trim() !== '' ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading gawali_wishlist from storage:', e);
      return [];
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
        // Apply favicon and document title immediately if present
        if (data.favicon) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.favicon;
        }
        if (data.storeName) {
          document.title = data.storeName;
        }
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateStoreSettings = async (newSettings: Omit<StoreSettings, 'id'>) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
          // Apply favicon and title
          if (data.settings.favicon) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = data.settings.favicon;
          }
          if (data.settings.storeName) {
            document.title = data.settings.storeName;
          }
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error updating store settings:', err);
      return false;
    }
  };


  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('gawali_user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gawali_token', token || '');
  }, [token]);

  useEffect(() => {
    localStorage.setItem('gawali_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gawali_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gawali_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync client profile with server on Firebase user state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
          
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'عميل متجر جوالي',
              phone: firebaseUser.phoneNumber || '',
              address: ''
            })
          });
          
          if (res.ok) {
            const syncData = await res.json();
            if (syncData.success) {
              setUser({
                id: syncData.user.uid,
                email: syncData.user.email,
                name: syncData.user.name,
                role: syncData.user.role,
                phone: syncData.user.phone,
                address: syncData.user.address,
                blocked: syncData.user.blocked || false,
              });
            }
          }
        } catch (err) {
          console.error('Error syncing Firebase auth state with server:', err);
        }
      } else {
        // Fallback for reviewer custom logins and mock admin sessions
        setUser((curr) => {
          const currentId = curr?.id || (curr as any)?.uid;
          const isLegacy = typeof currentId === 'string' && currentId.startsWith('user_legacy_');
          if (currentId === 'admin_1' || currentId === 'admin_joe' || isLegacy) {
            if (currentId === 'admin_1') {
              setToken('7418520963mobile#_token');
            } else if (currentId === 'admin_joe' || curr?.email === 'joooeeee77@gmail.com') {
              setToken('joooeeee77@gmail.com_token');
            }
            return curr;
          }
          setToken(null);
          return null;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshOrders = useCallback(async () => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const orderRes = await fetch(user?.role === 'admin' ? '/api/orders' : '/api/orders/me', { headers });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (Array.isArray(orderData)) {
          setOrders(orderData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders from server:', err);
    }
  }, [token, user?.role]);

  // Hydrate states from server on token or role updates
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            setProducts(prodData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch products from server:', err);
      }

      await refreshOrders();

      if (user?.role === 'admin') {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        try {
          const usersRes = await fetch('/api/users', { headers });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            if (Array.isArray(usersData)) {
              const mappedUsers = usersData.map((u: any) => ({
                id: u.uid || String(u.id),
                email: u.email,
                name: u.name,
                role: u.role,
                phone: u.phone,
                address: u.address,
                blocked: u.blocked
              }));
              setAllUsers(mappedUsers);
            }
          }
        } catch (err) {
          console.error('Failed to fetch users from server:', err);
        }
      }
    };

    fetchInitialData();
  }, [token, user?.role, refreshOrders]);

  // Periodic background polling to keep products and orders in sync, especially for admins
  useEffect(() => {
    const pollData = async () => {
      // Don't poll if page is hidden to save battery & CPU and avoid server load!
      if (typeof document !== 'undefined' && document.hidden) return;

      // 1. Sync products in background
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData)) {
            setProducts(prodData);
          }
        }
      } catch (err) {
        console.error('Failed background sync of products:', err);
      }

      // 2. Refresh orders
      await refreshOrders();

      // 2.5 Real-time active user block & role verification
      if (user && token) {
        try {
          const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 403) {
            setUser(prev => prev ? { ...prev, blocked: true } : null);
          } else if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setUser(prev => prev ? { 
                ...prev, 
                blocked: data.user.blocked || false,
                role: data.user.role || 'user',
                name: data.user.name,
                phone: data.user.phone,
                address: data.user.address
              } : null);
            }
          }
        } catch (err) {
          console.error('Failed real-time user validation poll:', err);
        }
      }

      // 3. Admin-only updates (Users lists)
      if (user?.role === 'admin') {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        try {
          const usersRes = await fetch('/api/users', { headers });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            if (Array.isArray(usersData)) {
              const mappedUsers = usersData.map((u: any) => ({
                id: u.uid || String(u.id),
                email: u.email,
                name: u.name,
                role: u.role,
                phone: u.phone,
                address: u.address,
                blocked: u.blocked
              }));
              setAllUsers(mappedUsers);
            }
          }
        } catch (err) {
          console.error('Failed background sync of users:', err);
        }
      }
    };

    // 30 seconds for admin, 90 seconds for normal users, to ensure the site is fast and smooth without high CPU lag
    const pollInterval = user?.role === 'admin' ? 30000 : 90000;
    const interval = setInterval(pollData, pollInterval);
    return () => clearInterval(interval);
  }, [token, user?.role, refreshOrders, user]);

  // Auth Operations
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      return { success: true };
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      return { success: false, error: err.message || 'فشل تسجيل الدخول باستخدام جوجل.' };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userObj = {
            ...data.user,
            id: data.user.uid || data.user.id,
            uid: data.user.uid || data.user.id
          };
          setToken(data.token);
          setUser(userObj);
          return { success: true, role: userObj.role };
        } else {
          return { success: false, error: data.error || 'فشل تسجيل الدخول.' };
        }
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
      }
    } catch (err: any) {
      console.warn('Database login failed, trying Firebase fallback:', err);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        return { success: true };
      } catch (fbErr: any) {
        return { success: false, error: 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.' };
      }
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone: string, address: string) => {
    if (!email || !name || !password) {
      return { success: false, error: 'يرجى تعبئة الحقول المطلوبة بما في ذلك كلمة المرور.' };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, address }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userObj = {
            ...data.user,
            id: data.user.uid || data.user.id,
            uid: data.user.uid || data.user.id
          };
          setToken(data.token);
          setUser(userObj);
          return { success: true };
        } else {
          return { success: false, error: data.error || 'فشل إنشاء الحساب.' };
        }
      } else {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.error || 'البريد الإلكتروني مسجل بالفعل أو الحقول غير صالحة.' };
      }
    } catch (err: any) {
      console.warn('Database register failed, trying Firebase fallback:', err);
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        const idToken = await result.user.getIdToken();
        setToken(idToken);

        try {
          const syncRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: result.user.uid,
              email,
              name,
              phone,
              address
            }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.success) {
              const userObj = {
                ...syncData.user,
                id: syncData.user.uid || syncData.user.id,
                uid: syncData.user.uid || syncData.user.id
              };
              setUser(userObj);
            }
          }
        } catch (syncErr) {
          console.error('Error syncing user with server:', syncErr);
        }

        return { success: true };
      } catch (fbErr: any) {
        return { success: false, error: fbErr.message || 'فشل إنشاء الحساب.' };
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error during Firebase signOut:', err);
    }
    setUser(null);
    setCart([]);
    setToken(null);
  }, []);

  // Cart Operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const liveProduct = products.find((p) => p.id === product.id);
      const stock = liveProduct ? liveProduct.stock : product.stock;

      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(stock, currentQty + quantity);
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      }
      
      const newQty = Math.min(stock, quantity);
      if (newQty <= 0) return prev;
      return [...prev, { product: liveProduct || product, quantity: newQty }];
    });
  }, [products]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const liveProduct = products.find((p) => p.id === productId);
          const stock = liveProduct ? liveProduct.stock : item.product.stock;
          const limitedQty = Math.min(stock, quantity);
          return { ...item, quantity: limitedQty };
        }
        return item;
      })
    );
  }, [removeFromCart, products]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Order Operations
  const placeOrder = useCallback(async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: 'cod' | 'bank_transfer';
    note?: string;
    shippingFee?: number;
  }) => {
    if (cart.length === 0) {
      throw new Error('فشل إنشاء الطلب بسبب فراغ سلة المشتريات.');
    }

    const newOrderId = 'order_' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + (details.shippingFee || 0);
    
    const orderToSave: Order = {
      id: newOrderId,
      userId: user?.id || null,
      customerName: details.customerName,
      customerEmail: details.customerEmail,
      customerPhone: details.customerPhone,
      deliveryAddress: details.deliveryAddress,
      paymentMethod: details.paymentMethod,
      items: [...cart],
      totalPrice: total,
      status: 'pending',
      note: details.note,
      createdAt: new Date().toISOString(),
    };

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderToSave),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل إرسال الطلب إلى الخادم. يرجى المحاولة لاحقاً.');
      }

      const orderData = await response.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'فشل تسجيل الطلب في قاعدة البيانات.');
      }

      setOrders((prev) => [orderToSave, ...prev]);
    } catch (err: any) {
      console.error('Error saving order to server:', err);
      throw err;
    }

    // Update local stock levels immediately
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const cartItem = orderToSave.items.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    clearCart();
    return orderToSave;
  }, [user, token, cart, clearCart, products]);

  // Admin Dashboard Operations (Product management)
  const addProduct = useCallback(async (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: 'p_' + Math.floor(1000 + Math.random() * 9000),
    };

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts((prev) => [data.product, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error adding product to server:', err);
      setProducts((prev) => [newProduct, ...prev]);
    }
  }, [token]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedProduct),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? data.product : p))
          );
        }
      }
    } catch (err) {
      console.error('Error updating product on server:', err);
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    }
  }, [token]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers,
      });
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Error deleting product from server:', err);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }, [token]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Error updating order status on server:', err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  }, [token]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  return (
    <StoreContext.Provider
      value={{
        user,
        products,
        cart,
        orders,
        wishlist,
        allUsers,
        token,
        storeSettings,
        updateStoreSettings,
        toggleWishlist,
        login,
        loginWithGoogle,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        refreshOrders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
