import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision, jsonb, boolean, index } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system fallback
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').$type<'user' | 'admin'>().default('user').notNull(),
  phone: text('phone'),
  address: text('address'),
  password: text('password'), // Optional password field for custom/secure credentials
  blocked: boolean('blocked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('users_uid_idx').on(table.uid),
  index('users_email_idx').on(table.email),
]);

// Define the 'products' table
export const products = pgTable('products', {
  id: text('id').primaryKey(), // We can use e.g. 'm1', 'h1' as ids or random UUIDs
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  category: text('category').notNull(), // 'mobiles' | 'headphones' | 'covers' | 'chargers' | 'accessories'
  subCategory: text('sub_category'), // 'airpods' | 'overear' | 'speakers' | 'wired' or null
  images: jsonb('images').$type<string[]>().notNull(), // string array
  stock: integer('stock').notNull(),
  brand: text('brand').notNull(),
  rating: doublePrecision('rating').default(5.0).notNull(),
  specs: jsonb('specs').$type<{ [key: string]: string }>().notNull(), // key-value specs
  condition: text('condition').$type<'new' | 'used'>().default('new'),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('products_category_idx').on(table.category),
  index('products_created_at_idx').on(table.createdAt),
]);

// Define the 'orders' table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // Firebase UID string or guest
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  paymentMethod: text('payment_method').$type<'cod' | 'bank_transfer'>().default('cod').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  status: text('status').$type<'pending' | 'confirmed' | 'preparing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'>().default('pending').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('orders_user_id_idx').on(table.userId),
  index('orders_customer_phone_idx').on(table.customerPhone),
  index('orders_created_at_idx').on(table.createdAt),
]);

// Define the 'order_items' table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: text('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: doublePrecision('price_at_purchase').notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
  index('order_items_product_id_idx').on(table.productId),
]);

// Define the 'reviews' table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id'), // Firebase uid of review author
  reviewerName: text('reviewer_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('reviews_product_id_idx').on(table.productId),
  index('reviews_created_at_idx').on(table.createdAt),
]);

// Define the 'activity_logs' table for security/audit trail
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  userId: text('user_id'), // Firebase UID or 'system' / 'guest'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('activity_logs_created_at_idx').on(table.createdAt),
]);

// Define relationships
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// Define the 'store_settings' table for general site settings
export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey(), // 'current'
  storeName: text('store_name').default('جوالي Gawali').notNull(),
  storeLogo: text('store_logo').default('/logo.png').notNull(),
  favicon: text('favicon').default('/favicon.ico').notNull(),
  contactNumbers: text('contact_numbers').default('01000117260').notNull(),
  emailAddress: text('email_address').default('support@gawali.com').notNull(),
  whatsappNumber: text('whatsapp_number').default('01000117260').notNull(),
  socialFacebook: text('social_facebook').default('https://facebook.com').notNull(),
  socialInstagram: text('social_instagram').default('https://instagram.com').notNull(),
  socialTwitter: text('social_twitter').default('https://twitter.com').notNull(),
  socialTiktok: text('social_tiktok').default('https://tiktok.com').notNull(),
  homepageBanners: jsonb('homepage_banners').$type<string[]>().default([
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=95',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&q=95',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=95'
  ]).notNull(),
  homepageAnnouncement: text('homepage_announcement').default('🔥 تخفيضات كبرى تصل إلى 40% على جميع الهواتف والإلكترونيات بمناسبة الصيف! 🔥').notNull(),
  footerInformation: text('footer_information').default('جوالي للإلكترونيات - المنصة الأولى لشراء الهواتف الذكية وملحقاتها الأصلية في مصر بأفضل الأسعار وأسرع شحن مجاني.').notNull(),
  shippingFees: jsonb('shipping_fees').$type<{ code: string; name: string; shippingFee: number; deliveryTime: string }[]>().default([
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
  ]).notNull(),
  paymentMethods: jsonb('payment_methods').$type<('cod' | 'bank_transfer')[]>().default(['cod', 'bank_transfer']).notNull(),
  categories: jsonb('categories').$type<any[]>().default([
    { id: 'mobiles', label: 'موبايلات', icon: '📱', order: 1, active: true, desc: 'هواتف ذكية راقية ومدعومة بالكامل' },
    { id: 'headphones', label: 'سماعات', icon: '🎧', order: 2, active: true, desc: 'سماعات رأس وصوت محيطي نقي' },
    { id: 'watches', label: 'ساعات', icon: '⌚', order: 3, active: true, desc: 'ساعات ذكية رياضية وصحية راقية' },
    { id: 'covers', label: 'غطية حماية', icon: '🛡️', order: 4, active: true, desc: 'جرابات MagSafe وحماية للصدمات' },
    { id: 'chargers', label: 'شواحن', icon: '⚡', order: 5, active: true, desc: 'قوالب شحن سريعة وراسية فائقة' },
    { id: 'accessories', label: 'إكسسوارات', icon: '🔌', order: 6, active: true, desc: 'قطع، منصات تثبيت، ولوازم ذكية' }
  ]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

