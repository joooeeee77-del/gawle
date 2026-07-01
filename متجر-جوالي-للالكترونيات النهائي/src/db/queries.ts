import { db } from './index.ts';
import { products, users, orders, orderItems, reviews, activityLogs } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { INITIAL_PRODUCTS } from '../data/initialProducts.ts';

// 1. User Helpers
export async function getOrCreateUser(uid: string, email: string, name: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name,
        role: email.toLowerCase() === 'mobile@admin.com' || email.toLowerCase() === 'joooeeee77@gmail.com' ? 'admin' : 'user',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Failed to register or retrieve user profile.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getUserByUid:', error);
    throw new Error('Failed to fetch user by UID.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw new Error('Failed to fetch all users.', { cause: error });
  }
}

export async function updateUserRole(uid: string, role: 'user' | 'admin') {
  try {
    const result = await db.update(users)
      .set({ role })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}

// 2. Product Helpers
export async function getProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.displayOrder), desc(products.createdAt));
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw new Error('Failed to fetch products.', { cause: error });
  }
}

export async function getProductById(id: string) {
  try {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw new Error(`Failed to fetch product with id: ${id}`, { cause: error });
  }
}

export async function createProduct(data: any) {
  try {
    const result = await db.insert(products)
      .values({
        id: data.id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        subCategory: data.subCategory || null,
        images: data.images || [],
        stock: Number(data.stock),
        brand: data.brand,
        rating: Number(data.rating || 5.0),
        specs: data.specs || {},
        condition: data.condition || 'new',
        displayOrder: Number(data.displayOrder || 0),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw new Error('Failed to create product.', { cause: error });
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const result = await db.update(products)
      .set({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        subCategory: data.subCategory || null,
        images: data.images,
        stock: Number(data.stock),
        brand: data.brand,
        rating: Number(data.rating),
        specs: data.specs,
        condition: data.condition,
        displayOrder: Number(data.displayOrder || 0),
      })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw new Error(`Failed to update product with id: ${id}`, { cause: error });
  }
}

export async function deleteProduct(id: string) {
  try {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw new Error(`Failed to delete product with id: ${id}`, { cause: error });
  }
}

// 3. Order Helpers
export async function getOrders() {
  try {
    const rows = await db.select({
      order: orders,
      item: orderItems,
      product: products
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .orderBy(desc(orders.createdAt));

    const ordersMap = new Map<string, any>();
    for (const row of rows) {
      const orderId = row.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          ...row.order,
          items: []
        });
      }
      if (row.item && row.product) {
        ordersMap.get(orderId).items.push({
          product: row.product,
          quantity: row.item.quantity,
          priceAtPurchase: row.item.priceAtPurchase
        });
      }
    }
    return Array.from(ordersMap.values());
  } catch (error) {
    console.error('Error in getOrders:', error);
    throw new Error('Failed to fetch orders.', { cause: error });
  }
}

export async function getOrdersByUserId(userId: string) {
  try {
    const rows = await db.select({
      order: orders,
      item: orderItems,
      product: products
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

    const ordersMap = new Map<string, any>();
    for (const row of rows) {
      const orderId = row.order.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          ...row.order,
          items: []
        });
      }
      if (row.item && row.product) {
        ordersMap.get(orderId).items.push({
          product: row.product,
          quantity: row.item.quantity,
          priceAtPurchase: row.item.priceAtPurchase
        });
      }
    }
    return Array.from(ordersMap.values());
  } catch (error) {
    console.error('Error in getOrdersByUserId:', error);
    throw new Error(`Failed to fetch orders for user: ${userId}`, { cause: error });
  }
}

export async function createOrder(data: any) {
  try {
    // Insert main order record
    const [insertedOrder] = await db.insert(orders)
      .values({
        id: data.id,
        userId: data.userId || null,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        paymentMethod: data.paymentMethod || 'cod',
        totalPrice: Number(data.totalPrice),
        status: data.status || 'pending',
        note: data.note || null,
      })
      .returning();

    // Insert order items & adjust product stock
    const itemsResult = [];
    for (const item of data.items) {
      const [insertedItem] = await db.insert(orderItems)
        .values({
          orderId: insertedOrder.id,
          productId: item.product.id,
          quantity: item.quantity,
          priceAtPurchase: Number(item.product.price),
        })
        .returning();
      itemsResult.push(insertedItem);

      // Decrement stock in DB
      try {
        const prod = await getProductById(item.product.id);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db.update(products).set({ stock: newStock }).where(eq(products.id, prod.id));
        }
      } catch (stockErr) {
        console.error(`Failed to decrement stock for product ${item.product.id}:`, stockErr);
      }
    }

    const nestedItems = [];
    for (const item of data.items) {
      const prod = await getProductById(item.product.id);
      if (prod) {
        nestedItems.push({
          product: prod,
          quantity: item.quantity,
          priceAtPurchase: prod.price
        });
      }
    }

    return { ...insertedOrder, items: nestedItems };
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw new Error('Failed to create order.', { cause: error });
  }
}

export async function trackOrdersPublic(searchQuery: string) {
  try {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const cleanQ = q.replace(/\D/g, '');

    const rows = await db.select({
      order: orders,
      item: orderItems,
      product: products
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .orderBy(desc(orders.createdAt));

    const matchedOrdersMap = new Map<string, any>();
    for (const row of rows) {
      const order = row.order;
      const orderId = order.id;
      const orderPhoneClean = order.customerPhone.replace(/\D/g, '');
      const matchId = orderId.toLowerCase() === q || orderId.toLowerCase().includes(q);
      const matchPhone = cleanQ && orderPhoneClean && (orderPhoneClean.includes(cleanQ) || cleanQ.includes(orderPhoneClean));

      if (matchId || matchPhone) {
        if (!matchedOrdersMap.has(orderId)) {
          matchedOrdersMap.set(orderId, {
            ...order,
            items: []
          });
        }
        if (row.item && row.product) {
          matchedOrdersMap.get(orderId).items.push({
            product: row.product,
            quantity: row.item.quantity,
            priceAtPurchase: row.item.priceAtPurchase
          });
        }
      }
    }

    return Array.from(matchedOrdersMap.values());
  } catch (error) {
    console.error('Error in trackOrdersPublic:', error);
    throw new Error('Failed to track orders.', { cause: error });
  }
}

export async function updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'preparing' | 'ready_to_ship' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled') {
  try {
    // 1. Get current order to find previous status
    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!existingOrder) {
      throw new Error(`Order not found: ${id}`);
    }

    const previousStatus = existingOrder.status;

    // 2. Perform the update
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    const updatedOrder = result[0];

    // 3. Adjust stock based on status transitions
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      // Order cancelled -> restore stock
      const rawItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of rawItems) {
        const prod = await getProductById(item.productId);
        if (prod) {
          const newStock = prod.stock + item.quantity;
          await db.update(products).set({ stock: newStock }).where(eq(products.id, prod.id));
        }
      }
    } else if (previousStatus === 'cancelled' && status !== 'cancelled') {
      // Order reinstated -> reduce stock again
      const rawItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of rawItems) {
        const prod = await getProductById(item.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db.update(products).set({ stock: newStock }).where(eq(products.id, prod.id));
        }
      }
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw new Error(`Failed to update status for order: ${id}`, { cause: error });
  }
}

// 4. Review Helpers
export async function getProductReviews(productId: string) {
  try {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    throw new Error(`Failed to fetch reviews for product: ${productId}`, { cause: error });
  }
}

export async function createReview(data: any) {
  try {
    const [newReview] = await db.insert(reviews)
      .values({
        productId: data.productId,
        userId: data.userId || null,
        reviewerName: data.reviewerName,
        rating: Number(data.rating),
        comment: data.comment,
      })
      .returning();

    // Re-calculate and update product overall rating
    try {
      const allReviews = await getProductReviews(data.productId);
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = Number((totalRating / allReviews.length).toFixed(1));
        await db.update(products).set({ rating: avgRating }).where(eq(products.id, data.productId));
      }
    } catch (ratingErr) {
      console.error('Failed to update product average rating:', ratingErr);
    }

    return newReview;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw new Error('Failed to create product review.', { cause: error });
  }
}

// 5. Audit Log Helpers
export async function createActivityLog(action: string, details: string, userId: string | null = null) {
  try {
    await db.insert(activityLogs).values({
      action,
      details,
      userId,
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}

export async function getActivityLogs() {
  try {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100);
  } catch (error) {
    console.error('Error in getActivityLogs:', error);
    throw new Error('Failed to fetch activity logs.', { cause: error });
  }
}

// 6. DB Seeding Routine
export async function seedProductsIfNeeded() {
  try {
    const existing = await db.select().from(products);
    
    // Only seed if the database is completely empty to prevent overwriting user modifications
    if (existing.length === 0) {
      console.log(`Database is completely empty. Seeding ${INITIAL_PRODUCTS.length} default products...`);
      
      for (const prod of INITIAL_PRODUCTS) {
        await db.insert(products).values({
          id: prod.id,
          name: prod.name,
          description: prod.description,
          price: Number(prod.price),
          category: prod.category,
          subCategory: prod.subCategory || null,
          images: prod.images || [],
          stock: Number(prod.stock),
          brand: prod.brand,
          rating: Number(prod.rating || 5.0),
          specs: prod.specs || {},
          condition: prod.condition || 'new',
        });
      }
      console.log(`Successfully seeded exactly ${INITIAL_PRODUCTS.length} default products into PostgreSQL.`);
    } else {
      console.log(`Database already has ${existing.length} products. Seeding bypassed and automatic synchronization disabled to preserve user-uploaded data and modifications.`);
    }
  } catch (error) {
    console.error('Error during product seeding:', error);
  }
}
