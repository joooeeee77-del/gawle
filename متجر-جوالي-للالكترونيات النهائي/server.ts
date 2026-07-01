import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import bcryptjs from 'bcryptjs';

// Database queries and setup
import { 
  seedProductsIfNeeded, 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getOrders, 
  getOrdersByUserId, 
  createOrder, 
  trackOrdersPublic,
  updateOrderStatus, 
  getOrCreateUser, 
  getAllUsers, 
  getProductReviews, 
  createReview, 
  getActivityLogs, 
  createActivityLog,
  getUserByUid
} from './src/db/queries.ts';

import { db } from './src/db/index.ts';
import { users, storeSettings, orders as ordersTable, orderItems, products } from './src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';

// Middleware imports
import { requireAuth, requireAdmin, AuthRequest } from './src/middleware/auth.ts';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Simple in-memory rate limiter to prevent DDoS / abuse
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max 100 requests per minute per IP

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  userLimit.count++;
  if (userLimit.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "تم تجاوز حد الطلبات المسموح به. يرجى المحاولة لاحقاً." });
  }

  next();
}

// Security Input Validation & XSS Prevention Helpers
export function sanitizeInput(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email: any): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: any): boolean {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result = { ...obj } as any;
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeInput(result[key].trim());
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure Robust Production-Ready Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: wss: ws:; frame-ancestors 'self' https://ai.studio https://*.google.com https://*.googleusercontent.com;");
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Apply rate limiter to all API endpoints
  app.use('/api', rateLimiter);

  // Initialize and seed products if needed
  try {
    await seedProductsIfNeeded();
  } catch (dbInitErr) {
    console.error("Database connection/seeding failed at startup:", dbInitErr);
  }

  // --- API ENDPOINTS ---

  // Custom secure database-backed login and registration endpoints
  app.post("/api/auth/register", async (req, res) => {
    let { email, password, name, phone, address } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: "بيانات التسجيل غير مكتملة. يرجى توفير البريد والاسم وكلمة المرور." });
    }

    // Input Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "البريد الإلكتروني غير صالح." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "يجب أن تكون كلمة المرور مكونة من 6 أحرف أو أكثر." });
    }
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, error: "رقم الهاتف غير صالح. يرجى إدخال رقم صحيح." });
    }

    // Sanitize user inputs to prevent XSS
    email = email.trim().toLowerCase();
    name = sanitizeInput(name.trim());
    phone = phone ? sanitizeInput(phone.trim()) : null;
    address = address ? sanitizeInput(address.trim()) : null;

    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, error: "البريد الإلكتروني مسجل بالفعل لدينا." });
      }

      // Hash password using bcryptjs
      const hashedPassword = bcryptjs.hashSync(password, 10);
      const uid = 'u_' + Math.random().toString(36).substring(2, 11);
      const role = email === 'joooeeee77@gmail.com' || email === 'mobile@admin.com' ? 'admin' : 'user';

      const [newUser] = await db.insert(users).values({
        uid,
        email,
        name,
        password: hashedPassword,
        role,
        phone,
        address,
      }).returning();

      await createActivityLog('user_register', `New user registered securely: ${email}`, uid);

      const token = 'custom_token_' + uid;
      res.json({ success: true, user: newUser, token });
    } catch (error: any) {
      console.error("Custom registration error:", error);
      res.status(500).json({ success: false, error: "فشل إنشاء الحساب وتخزينه في قاعدة البيانات." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "يرجى كتابة البريد الإلكتروني وكلمة المرور." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "البريد الإلكتروني غير صالح." });
    }

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const result = await db.select().from(users).where(eq(users.email, trimmedEmail)).limit(1);
      
      if (result.length === 0) {
        // Automatically seed admin account if they tried to log in with joooeeee77@gmail.com or mobile@admin.com for the first time
        if (trimmedEmail === 'joooeeee77@gmail.com' || trimmedEmail === 'mobile@admin.com') {
          const hashedPassword = bcryptjs.hashSync(password, 10);
          const uid = trimmedEmail === 'joooeeee77@gmail.com' ? 'admin_joe' : 'admin_1';
          const [newAdmin] = await db.insert(users).values({
            uid,
            email: trimmedEmail,
            name: trimmedEmail === 'joooeeee77@gmail.com' ? 'أدمن جوزيف' : 'مدير جوالي',
            password: hashedPassword,
            role: 'admin',
          }).returning();
          
          await createActivityLog('admin_auto_seed', `Admin seeded automatically upon secure setup: ${trimmedEmail}`, uid);
          const token = 'custom_token_' + uid;
          return res.json({ success: true, user: newAdmin, token, role: 'admin' });
        }
        return res.status(401).json({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }

      const user = result[0];
      
      if (user.blocked) {
        return res.status(403).json({ success: false, error: "تم حظر هذا الحساب من قبل الإدارة. يرجى الاتصال بالدعم الفني." });
      }

      // If user exists but doesn't have a password yet (e.g., synced from social login or legacy), let them set this password as their password,
      // or verify the password securely if they have one.
      if (!user.password) {
        const hashedPassword = bcryptjs.hashSync(password, 10);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.uid, user.uid));
        user.password = hashedPassword;
      }

      // Verify hashed password
      const isMatch = bcryptjs.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }

      await createActivityLog('user_login', `User logged in securely: ${trimmedEmail}`, user.uid);

      const token = 'custom_token_' + user.uid;
      res.json({ success: true, user, token, role: user.role });
    } catch (error: any) {
      console.error("Custom login error:", error);
      res.status(500).json({ success: false, error: "فشل التحقق من بيانات الدخول في قاعدة البيانات." });
    }
  });

  // 1. User Profile Sync & Register
  app.post("/api/users", async (req, res) => {
    const { uid, email, name, phone, address } = req.body;
    if (!uid || !email || !name) {
      return res.status(400).json({ success: false, error: "بيانات المستخدم غير مكتملة." });
    }

    try {
      const user = await getOrCreateUser(uid, email, name);
      
      // Update phone and address if they were provided
      if (phone || address) {
        await db.update(users)
          .set({ phone: phone || user.phone, address: address || user.address })
          .where(eq(users.uid, uid));
      }

      await createActivityLog('user_sync', `Synced profile for user: ${email}`, uid);
      res.json({ success: true, user: { ...user, phone: phone || user.phone, address: address || user.address } });
    } catch (error: any) {
      console.error("User profile sync error:", error);
      res.status(500).json({ success: false, error: "تعذر حفظ بيانات الملف الشخصي." });
    }
  });

  // Get current logged-in user profile (checks blocked status in real-time)
  app.get("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await getUserByUid(req.user?.uid!);
      if (!dbUser) {
        return res.status(404).json({ success: false, error: "المستخدم غير موجود." });
      }
      res.json({ success: true, user: dbUser });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Fetch all users (Admin only)
  app.get("/api/users", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const usersList = await getAllUsers();
      res.json(usersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user role (Admin only)
  app.put("/api/users/:uid/role", requireAdmin, async (req: AuthRequest, res) => {
    const { uid } = req.params;
    const { role } = req.body;
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ success: false, error: "الدور غير صالح." });
    }

    try {
      const [updated] = await db.update(users)
        .set({ role })
        .where(eq(users.uid, uid))
        .returning();

      if (!updated) {
        return res.status(404).json({ success: false, error: "المستخدم غير موجود." });
      }

      await createActivityLog('update_user_role', `Updated role of user ${updated.email} to ${role}`, req.user?.uid);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error("Update user role error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Block/unblock user account (Admin only)
  app.put("/api/users/:uid/block", requireAdmin, async (req: AuthRequest, res) => {
    const { uid } = req.params;
    const { blocked } = req.body;
    
    if (typeof blocked !== 'boolean') {
      return res.status(400).json({ success: false, error: "حالة الحظر يجب أن تكون قيمة منطقية (صح/خطأ)." });
    }

    try {
      const [updated] = await db.update(users)
        .set({ blocked })
        .where(eq(users.uid, uid))
        .returning();

      if (!updated) {
        return res.status(404).json({ success: false, error: "المستخدم غير موجود." });
      }

      await createActivityLog(blocked ? 'block_user' : 'unblock_user', `${blocked ? 'Blocked' : 'Unblocked'} user account: ${updated.email}`, req.user?.uid);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error("Block user account error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Store Settings (Public & Admin updates)
  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await db.select().from(storeSettings).where(eq(storeSettings.id, 'current')).limit(1);
      
      if (settings.length === 0) {
        // Create default settings row
        const [defaultSettings] = await db.insert(storeSettings)
          .values({
            id: 'current',
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
            homepageBanners: [
              'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=95',
              'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=95',
              'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=95'
            ],
            homepageAnnouncement: '🔥 تخفيضات كبرى تصل إلى 40% على جميع الهواتف والإلكترونيات بمناسبة الصيف! 🔥',
            footerInformation: 'جوالي للإلكترونيات - المنصة الأولى لشراء الهواتف الذكية وملحقاتها الأصلية في مصر بأفضل الأسعار وأسرع شحن مجاني.'
          })
          .returning();
        return res.json(defaultSettings);
      }

      res.json(settings[0]);
    } catch (error: any) {
      console.error("Fetch settings error:", error);
      res.status(500).json({ error: "فشل تحميل إعدادات المتجر." });
    }
  });

  app.put("/api/settings", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const {
        storeName,
        storeLogo,
        favicon,
        contactNumbers,
        emailAddress,
        whatsappNumber,
        socialFacebook,
        socialInstagram,
        socialTwitter,
        socialTiktok,
        homepageBanners,
        homepageAnnouncement,
        footerInformation,
        shippingFees,
        paymentMethods,
        categories
      } = req.body;

      const [updated] = await db.update(storeSettings)
        .set({
          storeName,
          storeLogo,
          favicon,
          contactNumbers,
          emailAddress,
          whatsappNumber,
          socialFacebook,
          socialInstagram,
          socialTwitter,
          socialTiktok,
          homepageBanners,
          homepageAnnouncement,
          footerInformation,
          shippingFees: shippingFees ? shippingFees : undefined,
          paymentMethods: paymentMethods ? paymentMethods : undefined,
          categories: categories ? categories : undefined,
          updatedAt: new Date()
        })
        .where(eq(storeSettings.id, 'current'))
        .returning();

      if (!updated) {
        return res.status(404).json({ success: false, error: "فشل تحديث الإعدادات." });
      }

      await createActivityLog('update_settings', `Updated store settings: Name=${storeName}`, req.user?.uid);
      res.json({ success: true, settings: updated });
    } catch (error: any) {
      console.error("Update settings error:", error);
      res.status(500).json({ success: false, error: "تعذر حفظ إعدادات المتجر." });
    }
  });

  // 2. Product Management
  app.get("/api/products", async (req, res) => {
    try {
      const list = await getProducts();
      res.json(list);
    } catch (error: any) {
      console.error("Fetch products error:", error);
      res.status(500).json({ error: "فشل تحميل المنتجات." });
    }
  });

  app.post("/api/products", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const product = await createProduct(req.body);
      await createActivityLog('create_product', `Created product: ${product.name} (${product.id})`, req.user?.uid);
      res.json({ success: true, product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const product = await updateProduct(id, req.body);
      await createActivityLog('update_product', `Updated product: ${product.name} (${id})`, req.user?.uid);
      res.json({ success: true, product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const deleted = await deleteProduct(id);
      await createActivityLog('delete_product', `Deleted product ID: ${id}`, req.user?.uid);
      res.json({ success: true, product: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Order Management
  app.get("/api/orders", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const list = await getOrders();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch orders specific to currently logged in user
  app.get("/api/orders/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "غير مصرح" });
      const userOrders = await getOrdersByUserId(uid);
      res.json(userOrders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Scoped and authenticated order tracking (excluding phone tracking entirely)
  app.get("/api/orders/track", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { q } = req.query;
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "غير مصرح" });

      let matchedOrders = [];
      if (q && typeof q === 'string' && q.trim()) {
        matchedOrders = await db.select()
          .from(ordersTable)
          .where(
            and(
              eq(ordersTable.id, q.trim()),
              eq(ordersTable.userId, uid)
            )
          )
          .orderBy(desc(ordersTable.createdAt));
      } else {
        matchedOrders = await db.select()
          .from(ordersTable)
          .where(eq(ordersTable.userId, uid))
          .orderBy(desc(ordersTable.createdAt));
      }

      const result = [];
      for (const order of matchedOrders) {
        const rawItems = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const nestedItems = [];
        for (const item of rawItems) {
          const [product] = await db.select().from(products).where(eq(products.id, item.productId));
          if (product) {
            nestedItems.push({
              product,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase
            });
          }
        }
        result.push({ ...order, items: nestedItems });
      }

      res.json(result);
    } catch (error: any) {
      console.error("Authenticated order tracking error:", error);
      res.status(500).json({ error: "فشل تحميل تتبع الطلبات الخاصة بك." });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = req.body;
      if (!data || !data.customerName || !data.customerPhone || !data.deliveryAddress || !Array.isArray(data.items) || data.items.length === 0) {
        return res.status(400).json({ error: "بيانات الطلب غير مكتملة. يرجى توفير الاسم والهاتف والعنوان والمنتجات المطلوبة." });
      }

      if (!isValidPhone(data.customerPhone)) {
        return res.status(400).json({ error: "رقم الهاتف غير صالح. يرجى إدخال رقم صحيح." });
      }

      if (data.customerEmail && !isValidEmail(data.customerEmail)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صالح." });
      }

      // Sanitize fields to prevent XSS
      const sanitizedData = {
        ...data,
        customerName: sanitizeInput(data.customerName.trim()),
        customerEmail: data.customerEmail ? data.customerEmail.trim().toLowerCase() : null,
        customerPhone: sanitizeInput(data.customerPhone.trim()),
        deliveryAddress: sanitizeInput(data.deliveryAddress.trim()),
        note: data.note ? sanitizeInput(data.note.trim()) : null,
      };

      const order = await createOrder(sanitizedData);
      await createActivityLog('create_order', `Created order: ${order.id} for EGP ${order.totalPrice}`, sanitizedData.userId || 'guest');
      res.json({ success: true, order });
    } catch (error: any) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "فشل إرسال الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى." });
    }
  });

  app.put("/api/orders/:id/status", requireAdmin, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const updated = await updateOrderStatus(id, status);
      await createActivityLog('update_order_status', `Updated order: ${id} status to ${status}`, req.user?.uid);
      res.json({ success: true, order: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Reviews Management
  app.get("/api/products/:id/reviews", async (req, res) => {
    const { id } = req.params;
    try {
      const list = await getProductReviews(id);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const { userId, reviewerName, rating, comment } = req.body;
    if (!reviewerName || rating === undefined || !comment) {
      return res.status(400).json({ error: "يرجى تعبئة جميع حقول التقييم." });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "التقييم يجب أن يكون قيمة بين 1 و 5 نجوم." });
    }

    // Sanitize values to prevent stored XSS attacks
    const sanitizedName = sanitizeInput(reviewerName.trim());
    const sanitizedComment = sanitizeInput(comment.trim());

    try {
      const review = await createReview({
        productId: id,
        userId: userId ? sanitizeInput(userId) : null,
        reviewerName: sanitizedName,
        rating: numericRating,
        comment: sanitizedComment,
      });
      await createActivityLog('create_review', `Added review to product: ${id}`, userId || 'guest');
      res.json({ success: true, review });
    } catch (error: any) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "فشل إضافة التقييم في قاعدة البيانات." });
    }
  });

  // 5. Activity Logs (Admin only)
  app.get("/api/activity-logs", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const logs = await getActivityLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. AI Support Chatbot (Gemini)
  app.post("/api/chat", async (req, res) => {
    const { messages, userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "الرجاء إدخال رسالة." });
    }

    try {
      const ai = getGeminiClient();

      // Fetch dynamic settings and products to inform the chatbot
      let settingsList = await db.select().from(storeSettings).where(eq(storeSettings.id, 'current')).limit(1);
      const activeProducts = await getProducts();

      const settings = settingsList[0] || {
        storeName: 'جوالي Gawali',
        contactNumbers: '01000117260',
        whatsappNumber: '01000117260',
        emailAddress: 'support@gawali.com',
        footerInformation: 'جوالي للإلكترونيات - المنصة الأولى لشراء الهواتف الذكية وملحقاتها الأصلية في مصر.',
        homepageAnnouncement: '',
        shippingFees: [] as any[],
        paymentMethods: ['cod'] as any[],
        categories: [] as any[]
      };

      const categoriesStr = Array.isArray(settings.categories) && settings.categories.length > 0
        ? settings.categories.filter((c: any) => c.active).map((c: any) => `- ${c.label} (${c.id}): ${c.desc || ''}`).join('\n')
        : "- موبايلات (mobiles)\n- سماعات (headphones)\n- ساعات (watches)\n- أغطية حماية (covers)\n- شواحن (chargers)\n- إكسسوارات (accessories)";

      const shippingStr = Array.isArray(settings.shippingFees) && settings.shippingFees.length > 0
        ? settings.shippingFees.map((sf: any) => `- محافظات ${sf.name} (رمز: ${sf.code}): الشحن ${sf.shippingFee} ج.م (وقت التوصيل: ${sf.deliveryTime || '2-3 أيام'})`).join('\n')
        : "- شحن مجاني بالكامل لجميع محافظات مصر بمناسبة الافتتاح!";

      const paymentsStr = Array.isArray(settings.paymentMethods) && settings.paymentMethods.length > 0
        ? settings.paymentMethods.map((pm: any) => pm === 'cod' ? 'الدفع عند الاستلام (Cash on Delivery)' : 'تحويل بنكي / فودافون كاش').join(' و ')
        : "الدفع عند الاستلام فقط لضمان الأمان والراحة للعملاء.";

      const productsStr = activeProducts && activeProducts.length > 0
        ? activeProducts.map((p: any) => `- ${p.name} (الماركة: ${p.brand}, القسم: ${p.category}): بسعر ${p.price} ج.م | الحالة: ${p.condition === 'used' ? 'مستعمل كسر زيرو' : 'جديد'} | المخزون المتاح: ${p.stock > 0 ? `${p.stock} وحدة` : 'نفذت الكمية'} | الوصف والمواصفات: ${p.description}`).join('\n')
        : "لا توجد منتجات معروضة حالياً، يرجى الاستفسار من المبيعات.";

      const formattedHistory = Array.isArray(messages) 
        ? messages.map((m: any) => `${m.sender === "user" ? "العميل" : "البوت"}: ${m.text}`).join("\n")
        : "";

      const systemPrompt = `
You are the official smart AI assistant for '${settings.storeName}' - the premier electronics and mobile storefront in Egypt.
Your purpose is to answer customer questions politely, guide them through buying products, recommend matched devices, and provide accurate answers about the store.
Always reply in friendly, helpful Egyptian Arabic (اللهجة المصرية العامية المحببة للعملاء).

Here is the LIVE STORE DATABASE and SETTINGS context you MUST adhere to:
1. Store Name: ${settings.storeName}
2. Contact Numbers: ${settings.contactNumbers}
3. WhatsApp Support Number: ${settings.whatsappNumber}
4. Support Email: ${settings.emailAddress}
5. Announcement Banner: ${settings.homepageAnnouncement || 'تخفيضات وعروض حصرية ممتازة بمناسبة الافتتاح!'}
6. About Us / Footer info: ${settings.footerInformation}

7. Store Categories:
${categoriesStr}

8. Live Product Catalog (ONLY recommend products from this list! Use EGP or ج.م currency):
${productsStr}

9. Delivery Areas & Shipping Fees:
${shippingStr}

10. Accepted Payment Methods:
${paymentsStr}

Rules for responses:
- Be incredibly polite, warm, and helpful. Format your messages beautifully using clear bullet points.
- NEVER invent or hallucinate products that are not in the dynamic live catalog list above.
- Mention prices in EGP (ج.م) exactly as listed.
- If a product has 0 stock (نفذت الكمية), tell the customer it is currently out of stock but they can pre-order/inquire via WhatsApp.
- Always encourage customers to contact WhatsApp support directly at ${settings.whatsappNumber} or wa.me/2${settings.whatsappNumber} for quick order execution!
`;

      const prompt = `
الرسائل السابقة كمرجع وسياق للمحادثة:
${formattedHistory}

سؤال العميل الحالي:
"${userMessage}"
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
        }
      });

      const aiText = response.text || "عذراً، لم أستطع معالجة السؤال حالياً. يرجى المحاولة مرة أخرى أو مراسلتنا عبر الواتساب مباشرة.";
      return res.json({ response: aiText });
    } catch (error: any) {
      console.error("Gemini API Chatbot error:", error);
      
      let fallbackText = `مرحباً بك! شكراً لتواصلك مع متجرنا. 📱\n\nأسئلتك تهمنا جداً؛ لتلقي استجابة فورية وحجز منتجاتك مباشرة، يمكنك التحدث فوراً مع ممثلي مبيعات متجرنا عبر الواتس آب مباشرة بالضغط على الزر الأخضر بالأسفل، أو الاتصال بالرقم الآتي:\n\n📞 *01000117260*\n\nتوصيلنا سريع وموثوق ومجاني بالكامل لكافة المحافظات المصرية والدفع نقداً عند الاستلام فقط!`;
      
      return res.json({ 
        response: fallbackText,
        error: error.message || "API_ERROR" 
      });
    }
  });

  // Vite development or production static asset configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
