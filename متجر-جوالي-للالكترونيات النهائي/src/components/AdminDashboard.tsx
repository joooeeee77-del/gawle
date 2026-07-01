import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, Smartphone, Percent, TrendingUp, AlertTriangle, Plus, Trash2, 
  Edit3, CheckCircle, Clock, Truck, ShieldAlert, X, ChevronDown, Check, 
  Users, MessageCircle, Search, Phone, History, Settings, CheckSquare, 
  HelpCircle, RefreshCw, BarChart2, Activity, Info, Folder, Layers
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Order, OrderStatus, Category, User, StoreCategory } from '../types';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// XSS/HTML Injection Sanitization Utility
const sanitizeInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim();
};

const DEFAULT_EGYPT_GOVERNORATES = [
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
  { code: 'EG-WAD', name: 'الوادي الجديد', shippingFee: 145, deliveryTime: '5 - 7 أيام' }
];

const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(base64);
          } else {
            resolve(result);
          }
        } catch (e) {
          console.error("Canvas compression failed, falling back to original base64", e);
          resolve(result);
        }
      };
      img.onerror = () => {
        console.warn("Failed to load image in Image object, falling back to FileReader result");
        resolve(result);
      };
      img.src = result;
    };
    reader.onerror = (error) => {
      console.error("FileReader failed", error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

export const AdminDashboard: React.FC = () => {
  const { 
    token, products, orders, allUsers = [], addProduct, 
    updateProduct, deleteProduct, updateOrderStatus,
    storeSettings, updateStoreSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'users' | 'activity' | 'settings' | 'categories'>('stats');

  // Search and Filter states
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Activity Logs States
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  // Local users list for instant role updates
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  useEffect(() => {
    if (allUsers) {
      setLocalUsers(allUsers);
    }
  }, [allUsers]);

  // Store metadata Settings Panel State
  const [settingsData, setSettingsData] = useState({
    storeName: 'جوالي Gawali',
    storeLogo: 'ج',
    favicon: '/favicon.ico',
    contactNumbers: '01000117260',
    emailAddress: 'support@gawali.com',
    whatsappNumber: '01000117260',
    socialFacebook: 'https://facebook.com',
    socialInstagram: 'https://instagram.com',
    socialTwitter: 'https://twitter.com',
    socialTiktok: 'https://tiktok.com',
    homepageAnnouncement: '🔥 تخفيضات كبرى تصل إلى 40% على جميع الهواتف والإلكترونيات بمناسبة الصيف! 🔥',
    footerInformation: 'جوالي للإلكترونيات - المنصة الأولى لشراء الهواتف الذكية وملحقاتها الأصلية في مصر بأفضل الأسعار وأسرع شحن مجاني.',
    homepageBanners: [] as string[],
    shippingFees: [] as { code: string; name: string; shippingFee: number; deliveryTime: string }[],
    paymentMethods: [] as ('cod' | 'bank_transfer')[],
    categories: [] as StoreCategory[]
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState('');
  const [govSearch, setGovSearch] = useState('');

  useEffect(() => {
    if (storeSettings) {
      setSettingsData({
        storeName: storeSettings.storeName || '',
        storeLogo: storeSettings.storeLogo || '',
        favicon: storeSettings.favicon || '',
        contactNumbers: storeSettings.contactNumbers || '',
        emailAddress: storeSettings.emailAddress || '',
        whatsappNumber: storeSettings.whatsappNumber || '',
        socialFacebook: storeSettings.socialFacebook || '',
        socialInstagram: storeSettings.socialInstagram || '',
        socialTwitter: storeSettings.socialTwitter || '',
        socialTiktok: storeSettings.socialTiktok || '',
        homepageAnnouncement: storeSettings.homepageAnnouncement || '',
        footerInformation: storeSettings.footerInformation || '',
        homepageBanners: storeSettings.homepageBanners || [],
        shippingFees: storeSettings.shippingFees || [],
        paymentMethods: storeSettings.paymentMethods || ['cod', 'bank_transfer'],
        categories: storeSettings.categories || [
          { id: 'mobiles', label: 'موبايلات', icon: '📱', order: 1, active: true, desc: 'هواتف ذكية راقية ومدعومة بالكامل' },
          { id: 'headphones', label: 'سماعات', icon: '🎧', order: 2, active: true, desc: 'سماعات رأس وصوت محيطي نقي' },
          { id: 'watches', label: 'ساعات', icon: '⌚', order: 3, active: true, desc: 'ساعات ذكية رياضية وصحية راقية' },
          { id: 'covers', label: 'غطية حماية', icon: '🛡️', order: 4, active: true, desc: 'جرابات MagSafe وحماية للصدمات' },
          { id: 'chargers', label: 'شواحن', icon: '⚡', order: 5, active: true, desc: 'قوالب شحن سريعة وراسية فائقة' },
          { id: 'accessories', label: 'إكسسوارات', icon: '🔌', order: 6, active: true, desc: 'قطع، منصات تثبيت، ولوازم ذكية' }
        ]
      });
    }
  }, [storeSettings]);

  const fetchActivityLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/activity-logs', { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [token]);

  // Load activity logs when tab changes
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivityLogs();
    }
  }, [activeTab, fetchActivityLogs]);

  // Promote/Demote User Role
  const handleUpdateRole = async (uid: string, newRole: 'user' | 'admin') => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/users/${uid}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLocalUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
          // Log locally
          setLogs(prev => [
            {
              id: Math.random().toString(),
              action: 'update_user_role',
              details: `Changed role of user to ${newRole}`,
              userId: uid,
              createdAt: new Date().toISOString()
            },
            ...prev
          ]);
        }
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  // Block/Unblock User
  const handleToggleBlock = async (uid: string, currentBlockedStatus: boolean) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const newBlocked = !currentBlockedStatus;
      const res = await fetch(`/api/users/${uid}/block`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ blocked: newBlocked })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLocalUsers(prev => prev.map(u => u.id === uid ? { ...u, blocked: newBlocked } : u));
          // Log locally
          setLogs(prev => [
            {
              id: Math.random().toString(),
              action: newBlocked ? 'block_user' : 'unblock_user',
              details: `${newBlocked ? 'حظر الحساب' : 'إلغاء حظر الحساب'} للمستخدم`,
              userId: uid,
              createdAt: new Date().toISOString()
            },
            ...prev
          ]);
        }
      }
    } catch (err) {
      console.error('Error toggling block status:', err);
    }
  };

  // WhatsApp contact helper link creator
  const getWhatsAppLink = (phone: string, orderId?: string) => {
    let cleanPhone = phone.replace(/\D/g, ''); // keep only digits
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone; // Egypt country code
    } else if (cleanPhone.startsWith('1')) {
      cleanPhone = '20' + cleanPhone;
    } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
      cleanPhone = '20' + cleanPhone;
    }
    const text = orderId 
      ? `مرحباً، بخصوص طلبك رقم #${orderId} في متجر جوالي 📱`
      : `مرحباً بك من متجر جوالي 📱`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Filtered Orders memo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const term = orderSearchQuery.toLowerCase().trim();
      const matchesSearch = 
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filtered Users memo
  const filteredUsers = useMemo(() => {
    const term = userSearchQuery.toLowerCase().trim();
    return localUsers.filter((user) => {
      return (
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
      );
    });
  }, [localUsers, userSearchQuery]);

  // Filtered Logs Memo
  const filteredLogs = useMemo(() => {
    const term = logSearch.toLowerCase().trim();
    return logs.filter((log) => {
      return (
        !term ||
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        (log.userId && log.userId.toLowerCase().includes(term))
      );
    });
  }, [logs, logSearch]);

  // Product CRUD states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Drag and drop images state
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  
  // Add/Edit Product form states
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<Category>('mobiles');
  const [prodSubCategory, setProdSubCategory] = useState<'airpods' | 'overear' | 'speakers' | 'wired' | ''>('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodBrand, setProdBrand] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodCondition, setProdCondition] = useState<'new' | 'used'>('new');
  const [prodSpecsText, setProdSpecsText] = useState(''); // newline separated "key: value"
  const [prodDisplayOrder, setProdDisplayOrder] = useState(0);
  const [productSortMode, setProductSortMode] = useState<'custom' | 'low_stock' | 'price_desc' | 'price_asc' | 'newest'>('custom');

  // Advanced Category Deletion Modal states
  const [deletingCategory, setDeletingCategory] = useState<StoreCategory | null>(null);
  const [deleteProductAction, setDeleteProductAction] = useState<'move' | 'uncategorize' | 'delete'>('move');
  const [targetCategoryForMove, setTargetCategoryForMove] = useState<string>('');
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  // Sorted products for Admin inventory view
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (productSortMode === 'low_stock') {
      return list.sort((a, b) => a.stock - b.stock);
    }
    if (productSortMode === 'price_desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (productSortMode === 'price_asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (productSortMode === 'newest') {
      return list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    // 'custom' order / default returned by DB queries (sorted by displayOrder desc, then by createdAt desc)
    return list.sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderB !== orderA) {
        return orderB - orderA;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [products, productSortMode]);

  // Metrics math
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const totalProductsCount = products.length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  // -- Recharts Chart Analytics Hydration --
  const salesHistoryChartData = useMemo(() => {
    // Group orders by date (last 7 days or matching days)
    const dailyMap = new Map<string, number>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((order) => {
        try {
          const dateStr = order.createdAt ? order.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + order.totalPrice);
        } catch {
          // fallback
        }
      });

    // Make an array sorted chronologically
    const sortedDays = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        name: date.substring(5), // Keep MM-DD
        'المبيعات (ج.م)': revenue,
      }));

    // Fallback data if empty to look perfectly beautiful
    if (sortedDays.length === 0) {
      return [
        { name: 'السبت', 'المبيعات (ج.م)': 24000 },
        { name: 'الأحد', 'المبيعات (ج.م)': 35000 },
        { name: 'الإثنين', 'المبيعات (ج.م)': 18000 },
        { name: 'الثلاثاء', 'المبيعات (ج.م)': 48000 },
        { name: 'الأربعاء', 'المبيعات (ج.م)': 30000 },
        { name: 'الخميس', 'المبيعات (ج.م)': 65000 },
        { name: 'الجمعة', 'المبيعات (ج.م)': 92000 },
      ];
    }
    return sortedDays;
  }, [orders]);

  const categoryDistributionData = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });

    const categoriesMap: { [key: string]: string } = {
      mobiles: 'موبايلات',
      headphones: 'سماعات',
      watches: 'ساعات',
      covers: 'كفرات',
      chargers: 'شواحن',
      accessories: 'إكسسوارات',
    };

    return Array.from(counts.entries()).map(([cat, val]) => ({
      name: categoriesMap[cat] || cat,
      value: val,
    }));
  }, [products]);

  const stockLevelChartData = useMemo(() => {
    return products.slice(0, 8).map((p) => ({
      name: p.name.split(' ').slice(0, 2).join(' '), // truncate to 2 words
      'المخزون': p.stock,
    }));
  }, [products]);

  // Colors for charts
  const CHART_COLORS = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#EC4899'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files) as File[];
      const base64Promises = filesArray.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                const MAX_DIM = 1400;
                if (width > MAX_DIM || height > MAX_DIM) {
                  if (width > height) {
                    height = Math.round((height * MAX_DIM) / width);
                    width = MAX_DIM;
                  } else {
                    width = Math.round((width * MAX_DIM) / height);
                    height = MAX_DIM;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img, 0, 0, width, height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                  resolve(dataUrl);
                } else {
                  resolve(result);
                }
              } catch (e) {
                console.error("Canvas scale failed, using original base64", e);
                resolve(result);
              }
            };
            img.onerror = () => {
              console.warn("Failed to load image, using original base64");
              resolve(result);
            };
            img.src = result;
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(base64Promises)
        .then((base64Strings) => {
          setProdImages((prev) => {
            const combined = [...prev, ...base64Strings];
            if (combined.length > 50) {
              alert('تم بلوغ الحد الأقصى للصور وهو 50 صورة.');
              return combined.slice(0, 50);
            }
            return combined;
          });
        })
        .catch((err) => console.error('Error reading files:', err));
    }
  };

  const makeMainImage = (idx: number) => {
    setProdImages((prev) => {
      if (idx === 0) return prev;
      const updated = [...prev];
      const [selected] = updated.splice(idx, 1);
      return [selected, ...updated];
    });
  };

  const moveImageOrder = (idx: number, direction: 'prev' | 'next') => {
    setProdImages((prev) => {
      const updated = [...prev];
      const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= updated.length) return prev;
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdCategory(product.category);
      setProdSubCategory(product.subCategory || '');
      setProdPrice(product.price);
      setProdStock(product.stock);
      setProdBrand(product.brand);
      setProdDescription(product.description);
      setProdImageUrl('');
      setProdImages(product.images || [product.images[0] || '']);
      setProdCondition(product.condition || 'new');
      setProdDisplayOrder(product.displayOrder || 0);
      
      const specsString = Object.entries(product.specs)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      setProdSpecsText(specsString);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdCategory('mobiles');
      setProdSubCategory('');
      setProdPrice(5000);
      setProdStock(10);
      setProdBrand('أبل');
      setProdDescription('');
      setProdImageUrl('');
      setProdImages([]);
      setProdCondition('new');
      setProdDisplayOrder(0);
      setProdSpecsText('الشاشة: 6.1 بوصة\nالذاكرة: 128 جيجابايت\nالبطارية: 4000 مللي أمبير');
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedSpecs: { [key: string]: string } = {};
    prodSpecsText.split('\n').forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = sanitizeInput(parts[0]);
        const val = sanitizeInput(parts.slice(1).join(':'));
        if (key && val) {
          parsedSpecs[key] = val;
        }
      }
    });

    const productPayload: any = {
      name: sanitizeInput(prodName),
      category: prodCategory,
      price: Number(prodPrice),
      stock: Number(prodStock),
      brand: sanitizeInput(prodBrand),
      description: sanitizeInput(prodDescription),
      images: prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'],
      rating: editingProduct ? editingProduct.rating : 4.8,
      specs: parsedSpecs,
      condition: prodCondition,
      displayOrder: Number(prodDisplayOrder || 0),
    };

    if (prodCategory === 'headphones' && prodSubCategory) {
      productPayload.subCategory = prodSubCategory;
    }

    if (editingProduct) {
      updateProduct({
        ...productPayload,
        id: editingProduct.id,
      });
    } else {
      addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> طلب معلق</span>;
      case 'confirmed':
        return <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5" /> تم التأكيد</span>;
      case 'preparing':
        return <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><TrendingUp className="w-3.5 h-3.5" /> قيد التجهيز</span>;
      case 'ready_to_ship':
        return <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Package className="w-3.5 h-3.5" /> جاهز للشحن</span>;
      case 'shipped':
        return <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-250 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Truck className="w-3.5 h-3.5" /> تم الشحن</span>;
      case 'out_for_delivery':
        return <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><Truck className="w-3.5 h-3.5 animate-pulse" /> خارج للتوصيل</span>;
      case 'delivered':
        return <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5" /> تم التوصيل</span>;
      case 'cancelled':
        return <span className="text-[10px] bg-red-50 text-red-700 border border-red-250 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"><ShieldAlert className="w-3.5 h-3.5" /> ملغي</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">{status}</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = settingsData.categories.find(c => c.id === category);
    return found ? found.label : category;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl" id="admin-dashboard-root">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800">لوحة تحكم المسؤول</h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-black">PRO VERSION</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            إدارة مبيعات الهواتف، المخزون، الطلبات، العملاء، السجلات التشغيلية والإعدادات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'products' && (
            <button
              onClick={() => handleOpenProductModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              id="add-product-btn"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          )}
          
          <button
            onClick={() => {
              if (activeTab === 'activity') fetchActivityLogs();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer text-slate-600"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>الإحصائيات والتحليلات</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الطلبات ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>المنتجات ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>العملاء والأدوار ({localUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل العمليات</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>أقسام المتجر واللوجو</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات المتجر</span>
        </button>
      </div>

      {/* Tab Contents: 1. Stats with Recharts Charts */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Metric Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">إجمالي المبيعات النشطة</span>
                <span className="text-xl font-extrabold text-slate-800">
                  {totalRevenue.toLocaleString('ar-EG')} <span className="text-xs font-black font-sans">ج.م</span>
                </span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
                <Package className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">الطلبات قيد المتابعة</span>
                <span className="text-xl font-extrabold text-slate-800">{activeOrders} طلباً</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">إجمالي الهواتف والمنتجات</span>
                <span className="text-xl font-extrabold text-slate-800">{totalProductsCount} منتجاً</span>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${outOfStockProducts > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">منتجات نفدت كميتها</span>
                <span className={`text-xl font-extrabold ${outOfStockProducts > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                  {outOfStockProducts} منتجات
                </span>
              </div>
            </div>

            {/* Metric Card 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">المستخدمون بالداتا بيز</span>
                <span className="text-xl font-extrabold text-slate-800">
                  {localUsers.length} مستخدم
                </span>
              </div>
            </div>
          </div>

          {/* Visual Interactive Analytics Section (Recharts Charts Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales performance chart (Area chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 text-right space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-800">مؤشر الإيرادات والمبيعات</h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 py-1 px-2.5 rounded-full font-bold">تحديث فوري</span>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesHistoryChartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                      formatter={(val) => [`${Number(val).toLocaleString()} ج.م`, 'المبيعات']}
                    />
                    <Area type="monotone" dataKey="المبيعات (ج.م)" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category breakdown (Pie Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs text-right space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800">توزيع المنتجات حسب الأقسام</h3>
              <div className="w-full h-72 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Labels list overlay */}
                <div className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1.5 pointer-events-none text-[10px] font-bold">
                  {categoryDistributionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 justify-end">
                      <span>{entry.name} ({entry.value})</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory level comparison (Bar Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-3 text-right space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800">مستويات مخزون الهواتف الأكثر مبيعاً</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockLevelChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="المخزون" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={32}>
                      {stockLevelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry['المخزون'] <= 3 ? '#EF4444' : '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab Contents: 2. Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
          {orders.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">
              لا توجد أي طلبات مسجلة حالياً بالمتجر. سيعرض أي طلب يقوم العملاء بإنشائه هنا فوراً.
            </div>
          ) : (
            <>
              {/* Filter and Search Bar */}
              <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
                {/* Status Tabs inside orders */}
                <div className="flex flex-wrap gap-1.5" dir="rtl">
                  {(['all', 'pending', 'confirmed', 'preparing', 'ready_to_ship', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] as const).map((status) => {
                    const label = 
                      status === 'all' ? 'الكل' :
                      status === 'pending' ? 'معلق' :
                      status === 'confirmed' ? 'مؤكد' :
                      status === 'preparing' ? 'تجهيز' :
                      status === 'ready_to_ship' ? 'جاهز للشحن' :
                      status === 'shipped' ? 'تم الشحن' :
                      status === 'out_for_delivery' ? 'خارج للتوصيل' :
                      status === 'delivered' ? 'توصيل' : 'ملغي';
                    
                    const count = status === 'all' 
                      ? orders.length 
                      : orders.filter(o => o.status === status).length;

                    return (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          orderStatusFilter === status 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Search field */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="ابحث برقم الطلب أو اسم العميل..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs focus:outline-hidden focus:border-blue-500 text-right font-semibold shadow-3xs"
                    dir="rtl"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-medium">
                  لا توجد طلبات تطابق معايير البحث والفلترة المحددة.
                </div>
              ) : (
                <>
                  {/* Desktop Table View (hidden on mobile) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right text-xs" dir="rtl">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold">
                        <tr>
                          <th className="p-4">رقم الطلب</th>
                          <th className="p-4">بيانات العميل</th>
                          <th className="p-4">المنتجات المطلوبة</th>
                          <th className="p-4">طريقة الدفع</th>
                          <th className="p-4">إجمالي السعر</th>
                          <th className="p-4">حالة الطلب</th>
                          <th className="p-4 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* ID info */}
                            <td className="p-4 font-mono font-bold text-slate-900 truncate">#{order.id}</td>

                            {/* Customer info column */}
                            <td className="p-4 space-y-1">
                              <p className="font-extrabold text-slate-800">{order.customerName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</span>
                                <a
                                  href={getWhatsAppLink(order.customerPhone, order.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-1.5 py-0.5 rounded-md transition-colors flex items-center gap-1 text-[9px] font-bold shadow-3xs"
                                  title="تواصل واتساب مباشرة"
                                >
                                  <MessageCircle className="w-2.5 h-2.5 fill-emerald-600 stroke-none" />
                                  <span>واتساب</span>
                                </a>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-1 truncate max-w-[150px]">{order.deliveryAddress}</p>
                            </td>

                            {/* Items Column */}
                            <td className="p-4 max-w-[180px]">
                              <div className="space-y-1">
                                {order.items.map((it) => (
                                  <p key={it.product.id} className="text-[10px] text-slate-600 line-clamp-1 truncate">
                                    - {it.product.name} (عدد: {it.quantity})
                                  </p>
                                ))}
                              </div>
                            </td>

                            {/* Payment */}
                            <td className="p-4">
                              <span className="text-[10px] bg-slate-100 py-1 px-2.5 rounded-md">
                                {order.paymentMethod === 'cod' ? 'عند الاستلام' : 'تحويل بنكي'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="p-4 font-black text-slate-800 font-sans">
                              {order.totalPrice.toLocaleString('ar-EG')} ج.م
                            </td>

                            {/* Current Status */}
                            <td className="p-4">{getStatusBadge(order.status)}</td>

                            {/* Update status actions */}
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px] font-bold focus:outline-hidden focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="pending">طلب معلق</option>
                                  <option value="confirmed">تم التأكيد</option>
                                  <option value="preparing">قيد التجهيز</option>
                                  <option value="ready_to_ship">جاهز للشحن</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="out_for_delivery">خارج للتوصيل</option>
                                  <option value="delivered">تم التوصيل</option>
                                  <option value="cancelled">إلغاء</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Flow View */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-black text-slate-900 text-sm">#{order.id}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="space-y-1.5">
                          <p className="font-extrabold text-slate-800 text-sm">{order.customerName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-mono" dir="ltr">{order.customerPhone}</span>
                            <a
                              href={getWhatsAppLink(order.customerPhone, order.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-1 px-2 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-extrabold shadow-3xs"
                              title="تواصل عبر واتساب مباشرة"
                            >
                              <MessageCircle className="w-3 h-3 fill-emerald-600 stroke-none" />
                              <span>تواصل واتساب</span>
                            </a>
                          </div>
                          <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100/50 leading-relaxed">
                            <span className="font-bold text-slate-500 block mb-0.5">العنوان:</span>
                            {order.deliveryAddress}
                          </p>
                          {order.note && (
                            <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100/50 leading-relaxed mt-1.5">
                              <span className="font-bold text-slate-500 block mb-0.5">ملاحظات العميل والتوصيل:</span>
                              {order.note}
                            </p>
                          )}
                        </div>

                        <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">المنتجات المطلوبة:</span>
                          <div className="space-y-1">
                            {order.items.map((it) => (
                              <p key={it.product.id} className="text-xs text-slate-700 font-semibold">
                                - {it.product.name} (عدد: {it.quantity})
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-150/50">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">الإجمالي الفاتورة:</span>
                            <span className="text-sm font-black text-slate-800 font-sans">{order.totalPrice.toLocaleString('ar-EG')} ج.م</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">الحالة:</span>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs"
                            >
                              <option value="pending">طلب معلق</option>
                              <option value="confirmed">تم التأكيد</option>
                              <option value="preparing">قيد التجهيز</option>
                              <option value="ready_to_ship">جاهز للشحن</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="out_for_delivery">خارج للتوصيل</option>
                              <option value="delivered">تم التوصيل</option>
                              <option value="cancelled">إلغاء</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab Contents: Users List & Roles management */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">إدارة صلاحيات وأدوار المستخدمين</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">ترقية الأعضاء إلى مدراء مبيعات (Admins) بنقرة واحدة مع مزامنة فورية بالداتا بيز.</p>
            </div>
            
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="ابحث عن مستخدم بالاسم أو الإيميل..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs focus:outline-hidden focus:border-blue-500 text-right font-semibold shadow-3xs"
                dir="rtl"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">
              لا توجد نتائج مطابقة لمصطلح البحث.
            </div>
          ) : (
            <>
              {/* Scrollable Table (Accessible on Mobile and Desktop) */}
              <div className="block overflow-x-auto w-full">
                <table className="w-full text-right text-xs min-w-[600px]" dir="rtl">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold">
                    <tr>
                      <th className="p-4">اسم العميل</th>
                      <th className="p-4">البريد الإلكتروني</th>
                      <th className="p-4">رقم الهاتف</th>
                      <th className="p-4">الصلاحية الحالية</th>
                      <th className="p-4 text-center">ترقية الصلاحيات</th>
                      <th className="p-4 text-center">حظر / إلغاء حظر الحساب</th>
                      <th className="p-4 text-center">تواصل سريع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-extrabold text-slate-800">{u.name}</td>
                        <td className="p-4 font-mono text-slate-500">{u.email}</td>
                        <td className="p-4 font-mono text-slate-500">{u.phone || 'غير مسجل'}</td>
                        <td className="p-4">
                          {u.role === 'admin' ? (
                            <span className="bg-amber-100 text-amber-800 py-1 px-2.5 rounded-full text-[10px] font-black">مسؤول (Admin)</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-full text-[10px]">مشتري عادي (User)</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value as 'user' | 'admin')}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold cursor-pointer focus:outline-hidden"
                          >
                            <option value="user">مشتري عادي</option>
                            <option value="admin">مسؤول مبيعات</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleBlock(u.id, !!u.blocked)}
                            className={`py-1 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                              u.blocked
                                ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-3xs'
                                : 'bg-emerald-50 border border-emerald-150 text-emerald-700 hover:bg-emerald-100 shadow-3xs'
                            }`}
                          >
                            {u.blocked ? '🔴 محظور (فك الحظر)' : '🟢 نشط (حظر الحساب)'}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          {u.phone ? (
                            <a
                              href={getWhatsAppLink(u.phone)}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-1 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 justify-center w-fit mx-auto"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 stroke-none" />
                              <span>مراسلة</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">---</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Contents: 3. Products list */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {products.length > 0 && (
            /* Sorting and Filters Control Panel */
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-right w-full lg:w-auto">
                <span className="text-xs font-extrabold text-slate-500 shrink-0">🔧 ترتيب ورص المنتجات:</span>
                <div className="flex flex-wrap gap-1.5" dir="rtl">
                  <button
                    onClick={() => setProductSortMode('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      productSortMode === 'custom'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📌 الترتيب المخصص (رص يدوي)
                  </button>
                  <button
                    onClick={() => setProductSortMode('low_stock')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      productSortMode === 'low_stock'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    ⚠️ الأقرب للنفاد أولاً (الكميات الأقل)
                  </button>
                  <button
                    onClick={() => setProductSortMode('newest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      productSortMode === 'newest'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ✨ المضافة حديثاً
                  </button>
                  <button
                    onClick={() => setProductSortMode('price_desc')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      productSortMode === 'price_desc'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💵 الأعلى سعراً
                  </button>
                  <button
                    onClick={() => setProductSortMode('price_asc')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      productSortMode === 'price_asc'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🏷️ الأقل سعراً
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-extrabold font-mono shrink-0">
                إجمالي المعروض: {products.length} منتج
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            {products.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-medium">
                لا توجد منتجات مسجلة. يرجى الضضط على "إضافة منتج جديد" لبدء البيع!
              </div>
            ) : (
              <>
              {/* Desktop Products Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right text-xs" dir="rtl">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold">
                    <tr>
                      <th className="p-4">صورة المنتج</th>
                      <th className="p-4">اسم المنتج</th>
                      <th className="p-4">الفئة</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">المخزون</th>
                      <th className="p-4">العلامة التجارية</th>
                      <th className="p-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {sortedProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50 border" referrerPolicy="no-referrer" />
                        </td>
                        <td className="p-4">
                          <p className="font-extrabold text-slate-800 line-clamp-1 max-w-[200px] truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {prod.id}</p>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                            {getCategoryLabel(prod.category)}
                          </span>
                        </td>
                        <td className="p-4 font-black text-slate-800 font-sans">{prod.price.toLocaleString('ar-EG')} ج.م</td>
                        <td className="p-4">
                          {prod.stock === 0 ? (
                            <span className="text-red-500 font-extrabold">نفد</span>
                          ) : prod.stock <= 3 ? (
                            <span className="text-amber-600 font-extrabold">منخفض ({prod.stock})</span>
                          ) : (
                            <span className="text-slate-700 font-bold">{prod.stock} وحدة</span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-500">{prod.brand}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(prod)}
                              className="bg-slate-50 text-slate-700 p-2 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) deleteProduct(prod.id); }}
                              className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card flow */}
              <div className="md:hidden divide-y divide-slate-100">
                {sortedProducts.map((prod) => (
                  <div key={prod.id} className="p-4 flex gap-3 items-start">
                    <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 rounded-lg object-cover border shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-grow space-y-1">
                      <p className="font-extrabold text-slate-800 text-xs">{prod.name}</p>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-mono text-slate-500">ID: {prod.id}</span>
                        <span className="font-black text-blue-600">{prod.price.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button onClick={() => handleOpenProductModal(prod)} className="bg-slate-100 text-slate-700 p-1 rounded-md text-[10px]">تعديل</button>
                        <button onClick={() => { if (confirm('متأكد؟')) deleteProduct(prod.id); }} className="bg-red-50 text-red-500 p-1 rounded-md text-[10px]">حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* Tab Contents: 4. Activity Logs Section */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200 text-right">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">أحدث عمليات المتجر والأنشطة الإدارية</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">سجل كامل للمراجعة الأمنية والرقابية للعمليات الإدارية والمبيعات.</p>
            </div>
            
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="ابحث في تفاصيل العمليات..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs focus:outline-hidden focus:border-blue-500 text-right font-semibold shadow-3xs"
                dir="rtl"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {loadingLogs ? (
            <div className="p-16 text-center text-slate-400 font-medium">جاري جلب سجل العمليات الحالي...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">لا توجد عمليات مسجلة متوافقة مع شروط البحث.</div>
          ) : (
            <div className="p-4 space-y-3.5">
              {filteredLogs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex gap-4 items-start p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all text-xs">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-extrabold text-slate-800 text-[11px]">{log.action === 'create_order' ? '🛒 إنشاء طلب جديد' : log.action === 'user_sync' ? '👤 مزامنة مستخدم' : '🔧 إجراء إداري'}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{log.createdAt ? new Date(log.createdAt).toLocaleString('ar-EG') : 'الآن'}</span>
                    </div>
                    <p className="text-slate-600 font-medium text-[11px]">{log.details}</p>
                    <p className="text-[9px] text-slate-400 font-mono">بواسطة المعرف: {log.userId || 'زائر'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: 5. Settings Panel */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200 text-right space-y-8" id="admin-settings-panel">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">لوحة التحكم وإعدادات المتجر الاحترافية</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">قم بتحديث الهوية البصرية، أرقام الهواتف، بنرات الواجهة، الإعلانات، والتواصل لتظهر التغييرات فورا لجميع الزوار بدون تعديل كود.</p>
          </div>

          {settingsSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
              <span className="text-base">✅</span>
              <span>{settingsSuccessMessage}</span>
            </div>
          )}

          {/* Section 1: Brand Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>🎨</span> الهوية البصرية واسم المتجر
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Store Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">اسم المتجر بالعربية</label>
                <input
                  type="text"
                  value={settingsData.storeName}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, storeName: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden font-bold"
                  placeholder="مثال: جوالي Gawali"
                />
              </div>

              {/* Store Logo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">شعار المتجر (رابط صورة أو حرف واحد)</label>
                <input
                  type="text"
                  value={settingsData.storeLogo}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, storeLogo: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden"
                  placeholder="رابط صورة / https أو حرف مثل: ج"
                />
              </div>

              {/* Favicon */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">أيقونة المتجر المفضلة (Favicon)</label>
                <input
                  type="text"
                  value={settingsData.favicon}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, favicon: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-left focus:outline-hidden font-mono text-slate-600"
                  placeholder="/favicon.ico أو رابط صورة مربع"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>📞</span> قنوات الاتصال والتواصل المباشر
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Numbers */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">أرقام هواتف الاتصال المتاحة</label>
                <input
                  type="text"
                  value={settingsData.contactNumbers}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, contactNumbers: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-left focus:outline-hidden font-mono"
                  placeholder="مثال: 01000117260 أو عدة أرقام"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">بريد الدعم الإلكتروني للمبيعات</label>
                <input
                  type="email"
                  value={settingsData.emailAddress}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, emailAddress: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-left focus:outline-hidden font-mono text-slate-600"
                  placeholder="support@gawali.com"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">رقم مبيعات الواتساب الرئيسي (مطلوب لإتمام الطلب)</label>
                <input
                  type="text"
                  value={settingsData.whatsappNumber}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-left focus:outline-hidden font-mono text-slate-800 font-bold"
                  placeholder="مثال: 01000117260"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Links */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>🌐</span> روابط حسابات التواصل الاجتماعي
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Facebook */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">فيسبوك Facebook</label>
                <input
                  type="text"
                  value={settingsData.socialFacebook}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, socialFacebook: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-left focus:outline-hidden font-mono"
                  placeholder="https://facebook.com/..."
                />
              </div>

              {/* Instagram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">إنستجرام Instagram</label>
                <input
                  type="text"
                  value={settingsData.socialInstagram}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, socialInstagram: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-left focus:outline-hidden font-mono"
                  placeholder="https://instagram.com/..."
                />
              </div>

              {/* Twitter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">تويتر Twitter / X</label>
                <input
                  type="text"
                  value={settingsData.socialTwitter}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, socialTwitter: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-left focus:outline-hidden font-mono"
                  placeholder="https://twitter.com/..."
                />
              </div>

              {/* TikTok */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">تيك توك TikTok</label>
                <input
                  type="text"
                  value={settingsData.socialTiktok}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, socialTiktok: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-left focus:outline-hidden font-mono"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>📝</span> الإعلانات ونصوص أسفل الصفحة (Footer)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Homepage Announcement */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">إعلان شريط الصفحة الرئيسية (العلوي)</label>
                <textarea
                  rows={2}
                  value={settingsData.homepageAnnouncement}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, homepageAnnouncement: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-right focus:outline-hidden font-semibold resize-none"
                  placeholder="اكتب إعلان ترويجي يظهر لجميع زوار موقع المتجر باللون الأزرق بالأعلى"
                />
              </div>

              {/* Footer Information */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">بيانات ونبذة أسفل الصفحة (Footer Info)</label>
                <textarea
                  rows={2}
                  value={settingsData.footerInformation}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, footerInformation: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-right focus:outline-hidden font-medium resize-none"
                  placeholder="اكتب نبذة أو رسالة توضيحية لمتجرك تظهر أسفل صفحات الويب لكل الزوار"
                />
              </div>
            </div>
          </div>

          {/* Section 4.5: Shipping Fees and Payment Methods */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>🚚</span> أسعار الشحن وطرق الدفع
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Payment Methods Checkboxes */}
              <div className="md:col-span-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-4 text-right">
                <label className="text-xs font-black text-slate-700 block">طرق الدفع المفعلة للمتجر</label>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">حدد طرق الدفع التي تود إتاحتها للمشترين في صفحة إتمام الطلب.</p>
                
                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settingsData.paymentMethods?.includes('cod')}
                      onChange={(e) => {
                        const methods = settingsData.paymentMethods || ['cod', 'bank_transfer'];
                        let updated = [...methods];
                        if (e.target.checked) {
                          if (!updated.includes('cod')) updated.push('cod');
                        } else {
                          updated = updated.filter(m => m !== 'cod');
                        }
                        if (updated.length === 0) {
                          alert('يجب إبقاء طريقة دفع واحدة مفعلة على الأقل.');
                          return;
                        }
                        setSettingsData(prev => ({ ...prev, paymentMethods: updated }));
                      }}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">الدفع عند الاستلام (COD)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={settingsData.paymentMethods?.includes('bank_transfer')}
                      onChange={(e) => {
                        const methods = settingsData.paymentMethods || ['cod', 'bank_transfer'];
                        let updated = [...methods];
                        if (e.target.checked) {
                          if (!updated.includes('bank_transfer')) updated.push('bank_transfer');
                        } else {
                          updated = updated.filter(m => m !== 'bank_transfer');
                        }
                        if (updated.length === 0) {
                          alert('يجب إبقاء طريقة دفع واحدة مفعلة على الأقل.');
                          return;
                        }
                        setSettingsData(prev => ({ ...prev, paymentMethods: updated }));
                      }}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">التحويل البنكي والدفع الإلكتروني</span>
                  </label>
                </div>
              </div>

              {/* Governorates Shipping Fees */}
              <div className="md:col-span-2 space-y-4 text-right">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 block">أسعار شحن المحافظات بمصر</label>
                    <span className="text-[10px] text-slate-400 font-bold block">اضبط سعر التوصيل والزمن المتوقع لكل محافظة بمصر.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل تريد فعلاً إعادة تعيين أسعار الشحن لجميع المحافظات إلى القيم الافتراضية الذكية للمتجر؟')) {
                        setSettingsData(prev => ({ ...prev, shippingFees: DEFAULT_EGYPT_GOVERNORATES }));
                      }
                    }}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    🔄 استعادة القيم الافتراضية
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={govSearch}
                    onChange={(e) => setGovSearch(e.target.value)}
                    placeholder="ابحث عن محافظة محددة (مثل: الإسكندرية، أسوان، الدقهلية...)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pr-9 pl-4 py-2.5 text-xs focus:outline-hidden font-semibold text-slate-700 placeholder:text-slate-400 text-right"
                  />
                </div>

                {/* Governorates list scrollable container */}
                <div className="max-h-[300px] overflow-y-auto border border-slate-150 rounded-2xl p-4 bg-slate-50/20 space-y-3.5 shadow-inner">
                  {((settingsData.shippingFees && settingsData.shippingFees.length > 0)
                    ? settingsData.shippingFees
                    : DEFAULT_EGYPT_GOVERNORATES
                  ).filter(g => g.name.includes(govSearch) || g.code.toLowerCase().includes(govSearch.toLowerCase())).length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-slate-400">
                      لا توجد محافظات تطابق بحثك الحالي.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {((settingsData.shippingFees && settingsData.shippingFees.length > 0)
                        ? settingsData.shippingFees
                        : DEFAULT_EGYPT_GOVERNORATES
                      )
                        .map((gov) => {
                          const matches = gov.name.includes(govSearch) || gov.code.toLowerCase().includes(govSearch.toLowerCase());
                          if (!matches) return null;
                          return (
                            <div key={gov.code} className="bg-white border border-slate-150 rounded-xl p-3 shadow-2xs space-y-2 text-right">
                              <span className="text-xs font-extrabold text-slate-800">{gov.name}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400">سعر الشحن (ج.م)</label>
                                  <input
                                    type="number"
                                    value={gov.shippingFee}
                                    onChange={(e) => {
                                      const fees = settingsData.shippingFees && settingsData.shippingFees.length > 0
                                        ? [...settingsData.shippingFees]
                                        : JSON.parse(JSON.stringify(DEFAULT_EGYPT_GOVERNORATES));
                                      const foundIdx = fees.findIndex((f: any) => f.code === gov.code);
                                      if (foundIdx !== -1) {
                                        fees[foundIdx].shippingFee = Math.max(0, parseInt(e.target.value) || 0);
                                        setSettingsData(prev => ({ ...prev, shippingFees: fees }));
                                      }
                                    }}
                                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-left focus:outline-hidden font-bold text-slate-800 font-sans"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-400">زمن التوصيل</label>
                                  <input
                                    type="text"
                                    value={gov.deliveryTime}
                                    onChange={(e) => {
                                      const fees = settingsData.shippingFees && settingsData.shippingFees.length > 0
                                        ? [...settingsData.shippingFees]
                                        : JSON.parse(JSON.stringify(DEFAULT_EGYPT_GOVERNORATES));
                                      const foundIdx = fees.findIndex((f: any) => f.code === gov.code);
                                      if (foundIdx !== -1) {
                                        fees[foundIdx].deliveryTime = e.target.value;
                                        setSettingsData(prev => ({ ...prev, shippingFees: fees }));
                                      }
                                    }}
                                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-right focus:outline-hidden font-semibold text-slate-700"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



          {/* Section 5: Homepage Banners (URLs) */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-extrabold text-blue-600 flex items-center gap-1.5">
                <span>📸</span> بنرات الصفحة الرئيسية المتحركة (Banners Slider)
              </h4>
              <button
                type="button"
                onClick={() => setSettingsData(prev => ({ ...prev, homepageBanners: [...prev.homepageBanners, ''] }))}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span>➕ إضافة بنر جديد</span>
              </button>
            </div>

            {settingsData.homepageBanners.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                لا توجد بنرات مخصصة حالياً. سيقوم المتجر بعرض البنرات الافتراضية الذكية تلقائياً.
              </div>
            ) : (
              <div className="space-y-3.5">
                {settingsData.homepageBanners.map((bannerUrl, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 items-center bg-slate-50/55 p-3 rounded-xl border border-slate-150 w-full">
                    <span className="text-xs font-bold text-slate-400 select-none shrink-0 md:w-16">بنر #{idx + 1}</span>
                    <div className="flex flex-col sm:flex-row gap-2 flex-grow w-full">
                      <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => {
                          const updated = [...settingsData.homepageBanners];
                          updated[idx] = e.target.value;
                          setSettingsData(prev => ({ ...prev, homepageBanners: updated }));
                        }}
                        className="flex-grow bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-left focus:outline-hidden font-mono text-slate-700"
                        placeholder="أدخل رابط صورة البنر (https://...) أو ارفع صورة باليسار"
                      />
                      
                      <label className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0 select-none border border-blue-200">
                        <span>📁</span>
                        <span>رفع صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const base64 = await compressAndConvertToBase64(file);
                                const updated = [...settingsData.homepageBanners];
                                updated[idx] = base64;
                                setSettingsData(prev => ({ ...prev, homepageBanners: updated }));
                              } catch (err) {
                                console.error(err);
                                alert('فشل تحميل الصورة، يرجى المحاولة مرة أخرى.');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    
                    {bannerUrl && (bannerUrl.startsWith('http') || bannerUrl.startsWith('/') || bannerUrl.startsWith('data:')) && (
                      <div className="w-14 h-9 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shrink-0 shadow-2xs">
                        <img src={bannerUrl} alt={`banner preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const updated = settingsData.homepageBanners.filter((_, uIdx) => uIdx !== idx);
                        setSettingsData(prev => ({ ...prev, homepageBanners: updated }));
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors px-2.5 py-2 rounded-lg font-bold shrink-0 cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5 pt-4">
            <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5"><Info className="w-4 h-4 text-blue-600" /> إرشادات الرقابة الإدارية والتطبيق المباشر</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              تعديل الإعدادات والخيارات أعلاه يقوم بتحديث واجهات المتجر للعملاء على الفور. سيتم تحديث اسم الموقع، الشعار، الأيقونة، البنرات الإعلانية، ونبذة المتجر لتبهر عملاءك. يرجى التأكد من صحة أرقام الهواتف وراوبط الاتصال.
            </p>
            
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={async () => {
                  setIsSavingSettings(true);
                  setSettingsSuccessMessage('');
                  const ok = await updateStoreSettings({
                    storeName: settingsData.storeName,
                    storeLogo: settingsData.storeLogo,
                    favicon: settingsData.favicon,
                    contactNumbers: settingsData.contactNumbers,
                    emailAddress: settingsData.emailAddress,
                    whatsappNumber: settingsData.whatsappNumber,
                    socialFacebook: settingsData.socialFacebook,
                    socialInstagram: settingsData.socialInstagram,
                    socialTwitter: settingsData.socialTwitter,
                    socialTiktok: settingsData.socialTiktok,
                    homepageAnnouncement: settingsData.homepageAnnouncement,
                    footerInformation: settingsData.footerInformation,
                    homepageBanners: settingsData.homepageBanners,
                    shippingFees: settingsData.shippingFees,
                    paymentMethods: settingsData.paymentMethods,
                    categories: settingsData.categories
                  });
                  setIsSavingSettings(false);
                  if (ok) {
                    setSettingsSuccessMessage('🎉 تم حفظ وتطبيق التغييرات لجميع واجهات موقع المتجر فورياً وبنجاح!');
                    setTimeout(() => setSettingsSuccessMessage(''), 5000);
                  } else {
                    alert('تعذر حفظ التغييرات، يرجى مراجعة الصلاحيات والاتصال بخادم المتجر.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold px-6 py-3 text-xs rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isSavingSettings ? (
                  <>
                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
                    <span>جاري الحفظ والتطبيق...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>حفظ وتطبيق التغييرات فورا</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: Categories & Logo Manager Panel */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200 text-right space-y-8" id="admin-categories-panel">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">📂</span>
              <span>هيكلة وترتيب أقسام المتجر واللوجو (Categories & Logo Manager)</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">أضف تصنيفات جديدة للمنتجات، ارفع شعارات وصور مخصصة لكل قسم، رتب ظهورهم للمشترين، وتحكم بشعار واسم المتجر بالكامل فورياً.</p>
          </div>

          {settingsSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
              <span className="text-base">✅</span>
              <span>{settingsSuccessMessage}</span>
            </div>
          )}

          {/* Part A: Store Logo & Favicon & Name (Logo Manager) */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <h4 className="text-xs font-extrabold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span>🎨</span> شعار وهُوية المتجر البصرية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Store Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">اسم المتجر بالعربية</label>
                <input
                  type="text"
                  value={settingsData.storeName}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, storeName: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden font-bold"
                  placeholder="مثال: جوالي Gawali"
                />
              </div>

              {/* Store Logo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">شعار المتجر (رابط صورة أو حرف واحد)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsData.storeLogo}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, storeLogo: e.target.value }))}
                    className="flex-grow bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden font-bold"
                    placeholder="مثال: ج أو رابط صورة لوجو"
                  />
                  <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-blue-200 cursor-pointer flex items-center justify-center shrink-0 transition select-none">
                    <span>رفع لوجو</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const base64 = await compressAndConvertToBase64(file);
                            setSettingsData(prev => ({ ...prev, storeLogo: base64 }));
                          } catch (err) {
                            console.error("Failed to compress store logo:", err);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setSettingsData(prev => ({ ...prev, storeLogo: reader.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Favicon */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">أيقونة المتجر بالموقع (Favicon URL)</label>
                <input
                  type="text"
                  value={settingsData.favicon}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, favicon: e.target.value }))}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden font-bold"
                  placeholder="رابط أيقونة المتجر"
                />
              </div>
            </div>
          </div>

          {/* Part B: Categories & Arrangement Manager (Categories Manager) */}
          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-blue-600 flex items-center gap-1.5">
                  <span>📂</span> هيكلة وترتيب أقسام المتجر
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  أضف تصنيفات جديدة (مثل الساعات والموبايلات والسماعات)، ارفع صورة/أيقونة مخصصة لكل قسم، ورتب ظهورهم للمشترين.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newId = 'cat_' + Math.floor(1000 + Math.random() * 9000);
                  const nextOrder = settingsData.categories.length > 0 
                    ? Math.max(...settingsData.categories.map(c => c.order)) + 1 
                    : 1;
                  const newCat: StoreCategory = {
                    id: newId,
                    label: 'قسم جديد',
                    icon: '📦',
                    order: nextOrder,
                    active: true,
                    desc: 'وصف قصير للقسم يظهر للمشترين',
                    badge: '',
                    color: 'blue'
                  };
                  setSettingsData(prev => ({
                    ...prev,
                    categories: [...prev.categories, newCat]
                  }));
                }}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
              >
                <span>➕ إضافة تصنيف جديد</span>
              </button>
            </div>

            {settingsData.categories.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                لا توجد تصنيفات مخصصة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {[...settingsData.categories]
                  .sort((a, b) => a.order - b.order)
                  .map((cat, idx, sortedArr) => {
                    return (
                      <div key={cat.id} className="flex flex-col gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200 w-full text-right shadow-2xs">
                        {/* Top: Header with title, active status and delete button */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            {/* Reordering Controls */}
                            <div className="flex gap-1 bg-slate-200/60 p-1 rounded-lg border border-slate-300">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx > 0) {
                                    const currentCat = sortedArr[idx];
                                    const prevCat = sortedArr[idx - 1];
                                    const tempOrder = currentCat.order;
                                    currentCat.order = prevCat.order;
                                    prevCat.order = tempOrder;

                                    const updatedCats = settingsData.categories.map(c => {
                                      if (c.id === currentCat.id) return { ...c, order: currentCat.order };
                                      if (c.id === prevCat.id) return { ...c, order: prevCat.order };
                                      return c;
                                    });
                                    setSettingsData(prev => ({ ...prev, categories: updatedCats }));
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md disabled:opacity-30 transition cursor-pointer text-xs"
                                title="نقل للأعلى"
                              >
                                🔼
                              </button>
                              <button
                                type="button"
                                disabled={idx === sortedArr.length - 1}
                                onClick={() => {
                                  if (idx < sortedArr.length - 1) {
                                    const currentCat = sortedArr[idx];
                                    const nextCat = sortedArr[idx + 1];
                                    const tempOrder = currentCat.order;
                                    currentCat.order = nextCat.order;
                                    nextCat.order = tempOrder;

                                    const updatedCats = settingsData.categories.map(c => {
                                      if (c.id === currentCat.id) return { ...c, order: currentCat.order };
                                      if (c.id === nextCat.id) return { ...c, order: nextCat.order };
                                      return c;
                                    });
                                    setSettingsData(prev => ({ ...prev, categories: updatedCats }));
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md disabled:opacity-30 transition cursor-pointer text-xs"
                                title="نقل للأسفل"
                              >
                                🔽
                              </button>
                            </div>

                            {/* Category Image / Icon Logo */}
                            <div className="relative w-10 h-10 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-3xs">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:image')) ? (
                                <img src={cat.icon} alt={cat.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-xl select-none">{cat.icon || '📦'}</span>
                              )}
                            </div>

                            <div>
                              <span className="text-xs font-extrabold text-slate-800">{cat.label || 'قسم بدون اسم'}</span>
                              <span className="mx-1.5 text-slate-300">|</span>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{cat.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Active Checkbox */}
                            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-extrabold transition hover:bg-slate-50">
                              <input
                                type="checkbox"
                                checked={cat.active}
                                onChange={(e) => {
                                  const updated = settingsData.categories.map(c => {
                                    if (c.id === cat.id) return { ...c, active: e.target.checked };
                                    return c;
                                  });
                                  setSettingsData(prev => ({ ...prev, categories: updated }));
                                }}
                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-slate-700">تنشيط القسم للزوار</span>
                            </label>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const affectedCount = products.filter(p => p.category === cat.id).length;
                                setDeletingCategory(cat);
                                setDeleteProductAction('move');
                                const otherCats = settingsData.categories.filter(c => c.id !== cat.id);
                                if (otherCats.length > 0) {
                                  setTargetCategoryForMove(otherCats[0].id);
                                } else {
                                  setTargetCategoryForMove('');
                                  setDeleteProductAction('uncategorize');
                                }
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl transition cursor-pointer"
                              title="حذف هذا القسم بالكامل"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Middle: Grid of inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {/* 1. Label */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500">اسم القسم بالكامل (عربي)</label>
                            <input
                              type="text"
                              value={cat.label}
                              onChange={(e) => {
                                const updated = settingsData.categories.map(c => {
                                  if (c.id === cat.id) return { ...c, label: e.target.value };
                                  return c;
                                });
                                setSettingsData(prev => ({ ...prev, categories: updated }));
                              }}
                              className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-right font-extrabold text-slate-800"
                              placeholder="اسم القسم"
                            />
                          </div>

                          {/* 2. Slug */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500">المعرّف اللاتيني (Slug)</label>
                            <input
                              type="text"
                              value={cat.id}
                              onChange={(e) => {
                                const sanitizedId = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                const updated = settingsData.categories.map(c => {
                                  if (c.id === cat.id) return { ...c, id: sanitizedId };
                                  return c;
                                });
                                setSettingsData(prev => ({ ...prev, categories: updated }));
                              }}
                              disabled={['mobiles', 'headphones', 'watches', 'covers', 'chargers', 'accessories'].includes(cat.id)}
                              className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-left font-mono text-slate-600 disabled:bg-slate-100 disabled:text-slate-400"
                              placeholder="مثال: devices-discount"
                            />
                          </div>

                          {/* 3. Promo Badge */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500">شارة مميزة (أحدث، خصم...)</label>
                            <input
                              type="text"
                              value={cat.badge || ''}
                              onChange={(e) => {
                                const updated = settingsData.categories.map(c => {
                                  if (c.id === cat.id) return { ...c, badge: e.target.value };
                                  return c;
                                });
                                setSettingsData(prev => ({ ...prev, categories: updated }));
                              }}
                              className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-right font-bold text-slate-800 placeholder:text-slate-300"
                              placeholder="مثال: حار 🔥 أو كسر زيرو ✨"
                            />
                          </div>

                          {/* 4. Color Preset Theme */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500">سمة القسم والرمز التعبيري</label>
                            <select
                              value={cat.color || 'blue'}
                              onChange={(e) => {
                                const updated = settingsData.categories.map(c => {
                                  if (c.id === cat.id) return { ...c, color: e.target.value };
                                  return c;
                                });
                                setSettingsData(prev => ({ ...prev, categories: updated }));
                              }}
                              className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-right font-bold text-slate-800"
                            >
                              <option value="blue">🔵 أزرق سماوي عصري</option>
                              <option value="purple">🟣 بنفسجي ملكي فاخر</option>
                              <option value="emerald">🟢 أخضر زمردي جذاب</option>
                              <option value="amber">🟠 برتقالي ذهبي مشع</option>
                              <option value="rose">🔴 وردي ساحر مميز</option>
                              <option value="indigo">🟡 نيلي كلاسيكي راقٍ</option>
                            </select>
                          </div>

                          {/* 5. Fallback Icon Emoji */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black text-slate-500">رمز تعبيري (Emoji)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={cat.icon && !cat.icon.startsWith('data:') && !cat.icon.startsWith('http') ? cat.icon : '📦'}
                                onChange={(e) => {
                                  const updated = settingsData.categories.map(c => {
                                    if (c.id === cat.id) return { ...c, icon: e.target.value };
                                    return c;
                                  });
                                  setSettingsData(prev => ({ ...prev, categories: updated }));
                                }}
                                className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-center font-bold flex-grow"
                                maxLength={3}
                              />
                              <label className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 text-[10px] font-bold px-2.5 py-2 rounded-xl cursor-pointer transition flex items-center justify-center shrink-0 select-none">
                                <span>صورة</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === 'string') {
                                          const updated = settingsData.categories.map(c => {
                                            if (c.id === cat.id) {
                                              return { ...c, icon: reader.result as string };
                                            }
                                            return c;
                                          });
                                          setSettingsData(prev => ({ ...prev, categories: updated }));
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Bottom row: Description */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-500">وصف تعريفي قصير للقسم (يظهر للعملاء تحت العنوان لزيادة الجاذبية البصرية)</label>
                          <input
                            type="text"
                            value={cat.desc || ''}
                            onChange={(e) => {
                              const updated = settingsData.categories.map(c => {
                                if (c.id === cat.id) return { ...c, desc: e.target.value };
                                return c;
                              });
                              setSettingsData(prev => ({ ...prev, categories: updated }));
                            }}
                            className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-right text-slate-600 font-bold"
                            placeholder="مثال: تصفح أحدث التقنيات وأفضل الشواحن والملحقات الفاخرة بضمان معتمد..."
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Advanced Category Deletion Interactive Modal */}
          {deletingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setDeletingCategory(null)} />
              
              <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 text-right p-6 space-y-5" dir="rtl">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">🗑️</span>
                    <span>خيارات حذف القسم الذكي: {deletingCategory.label}</span>
                  </h3>
                  <button onClick={() => setDeletingCategory(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 font-bold space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>تنبيه هام ومحمي لقاعدة البيانات:</span>
                  </p>
                  <p className="font-medium text-amber-800 leading-relaxed text-right">
                    هذا القسم يحتوي على <span className="underline font-black">{products.filter(p => p.category === deletingCategory.id).length} من المنتجات النشطة</span> في متجرك حالياً. لتجنب اختفاء المنتجات أو حدوث أخطاء لزوار الموقع، يرجى اختيار الإجراء المناسب للتعامل مع هذه المنتجات:
                  </p>
                </div>

                {products.filter(p => p.category === deletingCategory.id).length > 0 && (
                  <div className="space-y-3.5 text-right">
                    <span className="block text-xs font-black text-slate-700">ماذا ترغب أن تفعل بمنتجات هذا القسم؟</span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Option A: Relocate / Move to another category */}
                      {settingsData.categories.filter(c => c.id !== deletingCategory.id).length > 0 && (
                        <label className={`flex flex-col p-3 rounded-xl border transition cursor-pointer text-right ${deleteProductAction === 'move' ? 'bg-blue-50/70 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="deleteAction"
                              value="move"
                              checked={deleteProductAction === 'move'}
                              onChange={() => setDeleteProductAction('move')}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="text-xs font-extrabold text-slate-800">نقل المنتجات إلى قسم آخر نشط</span>
                          </div>
                          {deleteProductAction === 'move' && (
                            <div className="mt-2.5 mr-6 animate-in slide-in-from-top-2 duration-200">
                              <select
                                value={targetCategoryForMove}
                                onChange={(e) => setTargetCategoryForMove(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-right"
                              >
                                {settingsData.categories
                                  .filter(c => c.id !== deletingCategory.id)
                                  .map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.icon && !c.icon.startsWith('http') && !c.icon.startsWith('data:') ? c.icon + ' ' : ''}{c.label} ({c.id})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </label>
                      )}

                      {/* Option B: Uncategorize */}
                      <label className={`flex flex-col p-3 rounded-xl border transition cursor-pointer text-right ${deleteProductAction === 'uncategorize' ? 'bg-blue-50/70 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deleteAction"
                            value="uncategorize"
                            checked={deleteProductAction === 'uncategorize'}
                            onChange={() => setDeleteProductAction('uncategorize')}
                            className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span className="text-xs font-extrabold text-slate-800">جعل المنتجات بدون تصنيف (أو نقلها لقسم غير مصنف)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mr-6 mt-1 text-right">ستبقى المنتجات متاحة بالبحث ولكن لن تظهر في الأقسام الرئيسية.</p>
                      </label>

                      {/* Option C: Delete All */}
                      <label className={`flex flex-col p-3 rounded-xl border transition cursor-pointer text-right ${deleteProductAction === 'delete' ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="deleteAction"
                            value="delete"
                            checked={deleteProductAction === 'delete'}
                            onChange={() => setDeleteProductAction('delete')}
                            className="text-rose-600 focus:ring-rose-500 w-4 h-4"
                          />
                          <span className="text-xs font-extrabold text-rose-700">حذف جميع المنتجات التابعة لهذا القسم نهائياً من المتجر ⚠️</span>
                        </div>
                        <p className="text-[10px] text-rose-500/80 font-bold mr-6 mt-1 text-right">احذر! سيتم حذف المنتجات نهائياً ولا يمكن التراجع عن هذا الإجراء.</p>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setDeletingCategory(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 text-xs rounded-xl transition cursor-pointer"
                  >
                    إلغاء الحذف
                  </button>
                  <button
                    disabled={isProcessingDelete}
                    onClick={async () => {
                      setIsProcessingDelete(true);
                      try {
                        const affectedProducts = products.filter(p => p.category === deletingCategory.id);
                        
                        if (affectedProducts.length > 0) {
                          if (deleteProductAction === 'move') {
                            const target = targetCategoryForMove || 'accessories';
                            for (const prod of affectedProducts) {
                              await updateProduct({ ...prod, category: target });
                            }
                          } else if (deleteProductAction === 'uncategorize') {
                            for (const prod of affectedProducts) {
                              await updateProduct({ ...prod, category: 'uncategorized' });
                            }
                          } else if (deleteProductAction === 'delete') {
                            for (const prod of affectedProducts) {
                              await deleteProduct(prod.id);
                            }
                          }
                        }

                        // Now remove the category
                        const updated = settingsData.categories.filter(c => c.id !== deletingCategory.id);
                        setSettingsData(prev => ({ ...prev, categories: updated }));
                        
                        // Automatically update store settings with the new categories list
                        await updateStoreSettings({
                          ...settingsData,
                          categories: updated
                        });

                        setSettingsSuccessMessage(`🎉 تم حذف قسم "${deletingCategory.label}" بنجاح وتصحيح أوضاع المنتجات المرتبطة به فورياً!`);
                        setTimeout(() => setSettingsSuccessMessage(''), 5000);
                        setDeletingCategory(null);
                      } catch (err) {
                        console.error(err);
                        alert('حدث خطأ أثناء إجراء معالجة حذف القسم.');
                      } finally {
                        setIsProcessingDelete(false);
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-extrabold px-5 py-2 text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isProcessingDelete ? (
                      <>
                        <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
                        <span>جاري معالجة البيانات...</span>
                      </>
                    ) : (
                      <span>تأكيد حذف القسم الآن</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Button for Categories Tab */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={async () => {
                setIsSavingSettings(true);
                const ok = await updateStoreSettings({
                  ...settingsData,
                  storeName: settingsData.storeName,
                  storeLogo: settingsData.storeLogo,
                  favicon: settingsData.favicon,
                  categories: settingsData.categories
                });
                setIsSavingSettings(false);
                if (ok) {
                  setSettingsSuccessMessage('🎉 تم تطبيق هيكلة الأقسام وشعار المتجر فورياً لجميع زوار موقع المتجر وبنجاح مذهل!');
                  setTimeout(() => setSettingsSuccessMessage(''), 5000);
                } else {
                  alert('تعذر حفظ التغييرات، يرجى مراجعة الصلاحيات والاتصال بخادم المتجر.');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold px-6 py-3 text-xs rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSavingSettings ? (
                <>
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
                  <span>جاري حفظ الهيكلة واللوجو...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>حفظ هيكلة الأقسام واللوجو فوراً</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Dynamic Dialog Panel */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsProductModalOpen(false)} />

          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] z-10 animate-in zoom-in-95" dir="rtl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">اسم المنتج المعتمد بالعربية *</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">التصنيف الدقيق للمنتج *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as Category)}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden cursor-pointer"
                  >
                    {settingsData.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">العلامة التجارية (الشركة المصنعة) *</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {prodCategory === 'headphones' && (
                <div className="flex flex-col gap-1 bg-blue-50/20 border border-blue-100/50 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-xs font-bold text-blue-800">نوع السماعة الفرعي *</label>
                  <select
                    value={prodSubCategory}
                    onChange={(e) => setProdSubCategory(e.target.value as 'airpods' | 'overear' | 'speakers' | 'wired')}
                    className="bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden cursor-pointer font-bold text-slate-700"
                    required
                  >
                    <option value="">-- اختر نوع السماعة الفرعي --</option>
                    <option value="airpods">ايربودز (AirPods / Earbuds)</option>
                    <option value="overear">هيدفون (Headphones / Over-Ear)</option>
                    <option value="speakers">صبات ومكبرات صوت (Speakers)</option>
                    <option value="wired">سماعات سلكية (Wired)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">السعر الفعلي (بالجنيه المصري) *</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    min={1}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-mono text-right focus:outline-hidden"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">كمية المخزون المتاحة *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    min={0}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-mono text-right focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">حالة المنتج *</label>
                  <select
                    value={prodCondition}
                    onChange={(e) => setProdCondition(e.target.value as 'new' | 'used')}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden cursor-pointer"
                  >
                    <option value="new">جديد (New)</option>
                    <option value="used">مستعمل (Used)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">ترتيب عرض المنتج (رقم أكبر = يظهر أولاً) *</label>
                  <input
                    type="number"
                    value={prodDisplayOrder}
                    onChange={(e) => setProdDisplayOrder(Number(e.target.value))}
                    min={0}
                    className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-mono text-right focus:outline-hidden"
                    placeholder="رقم أكبر يظهر أولاً (مثال: 100 يسبق 5)"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                <label className="text-xs font-black text-slate-700">صور المنتج *</label>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">رفع صور مباشرة من جهازك:</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 items-center mt-1">
                  <input
                    type="url"
                    placeholder="أو اكتب/ألصق رابط صورة إلكتروني هنا واضغط إضافة"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="flex-grow bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-right focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (prodImageUrl.trim()) {
                        if (prodImages.length >= 50) {
                          alert('تم بلوغ الحد الأقصى للصور وهو 50 صورة.');
                          return;
                        }
                        setProdImages((prev) => [...prev, prodImageUrl.trim()]);
                        setProdImageUrl('');
                      }
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    إضافة
                  </button>
                </div>

                {prodImages.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold">الصور المضافة ({prodImages.length}):</span>
                      <span className="text-[9px] text-blue-500 font-bold">💡 اسحب الصور لترتيبها، أو اضغط النجمة ★ لتحديد الصورة الرئيسية</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200">
                      {prodImages.map((img, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => setDraggedImageIndex(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (draggedImageIndex !== null && draggedImageIndex !== idx) {
                              setProdImages((prev) => {
                                const updated = [...prev];
                                const [draggedItem] = updated.splice(draggedImageIndex, 1);
                                updated.splice(idx, 0, draggedItem);
                                return updated;
                              });
                            }
                            setDraggedImageIndex(null);
                          }}
                          className={`relative aspect-square rounded-xl overflow-hidden border bg-white flex flex-col items-center justify-center p-1 transition-all select-none cursor-grab active:cursor-grabbing group/img ${
                            idx === 0
                              ? 'border-amber-400 shadow-sm ring-2 ring-amber-400/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Image Thumbnail centered and uncropped */}
                          <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 rounded-lg p-0.5">
                            <img src={img} className="max-w-full max-h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                          </div>

                          {/* Image index overlay badge */}
                          <span className="absolute bottom-1 right-1 bg-slate-800/80 text-white text-[8px] font-mono px-1 rounded-sm">
                            {idx + 1}
                          </span>

                          {/* Top controls */}
                          <div className="absolute top-1 left-1 right-1 flex items-center justify-between pointer-events-auto">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => setProdImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="bg-red-500/90 text-white hover:bg-red-600 rounded-md w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer transition-colors"
                              title="حذف الصورة"
                            >
                              ✕
                            </button>

                            {/* Main Image Selector (Gold Star) */}
                            <button
                              type="button"
                              onClick={() => makeMainImage(idx)}
                              className={`rounded-md w-4.5 h-4.5 flex items-center justify-center text-[10px] shadow-xs cursor-pointer transition-all ${
                                idx === 0
                                  ? 'bg-amber-400 text-white'
                                  : 'bg-white/90 text-slate-400 hover:text-amber-500'
                              }`}
                              title={idx === 0 ? 'الصورة الرئيسية' : 'تعيين كصورة رئيسية'}
                            >
                              ★
                            </button>
                          </div>

                          {/* Manual Reordering Controls */}
                          <div className="absolute bottom-1 left-1 flex gap-0.5">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImageOrder(idx, 'prev')}
                                className="bg-slate-800/80 hover:bg-slate-900 text-white rounded-md w-3.5 h-3.5 flex items-center justify-center text-[8px] cursor-pointer"
                                title="تحريك للأمام"
                              >
                                ◀
                              </button>
                            )}
                            {idx < prodImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImageOrder(idx, 'next')}
                                className="bg-slate-800/80 hover:bg-slate-900 text-white rounded-md w-3.5 h-3.5 flex items-center justify-center text-[8px] cursor-pointer"
                                title="تحريك للخلف"
                              >
                                ▶
                              </button>
                            )}
                          </div>

                          {/* "Main Image" text ribbon on first element */}
                          {idx === 0 && (
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500/90 text-white font-black text-[7px] px-1 rounded-sm shadow-3xs uppercase tracking-wider">
                              الرئيسية
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-amber-600 font-semibold mt-1">⚠️ يرجى رفع صورة واحدة على الأقل.</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">وصف المنتج بالعربية *</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500">المواصفات التقنية (ميزة: قيمة)</label>
                <textarea
                  value={prodSpecsText}
                  onChange={(e) => setProdSpecsText(e.target.value)}
                  rows={3}
                  placeholder="الشاشة: 6.7 بوصة&#10;المعالج: A17 Pro"
                  className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-right focus:outline-hidden resize-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
