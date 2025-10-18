import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, cartItems, orders, supportConversations, Product, CartItem, Order, SupportConversation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: typeof products.$inferInsert): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(product);
  return getProductById(product.id) as Promise<Product>;
}

// Cart queries
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(item: typeof cartItems.$inferInsert): Promise<CartItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(cartItems).values(item);
  return getCartItemById(item.id) as Promise<CartItem>;
}

export async function getCartItemById(id: string): Promise<CartItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cartItems).where(eq(cartItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function removeFromCart(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function updateCartItem(id: string, quantity: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function clearCart(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// Order queries
export async function createOrder(order: typeof orders.$inferInsert): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(order);
  return getOrderById(order.id) as Promise<Order>;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// Support conversation queries
export async function createSupportConversation(conversation: typeof supportConversations.$inferInsert): Promise<SupportConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(supportConversations).values(conversation);
  return getSupportConversationById(conversation.id) as Promise<SupportConversation>;
}

export async function getSupportConversationById(id: string): Promise<SupportConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportConversations).where(eq(supportConversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSupportConversations(userId: string): Promise<SupportConversation[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportConversations).where(eq(supportConversations.userId, userId));
}

export async function updateSupportConversation(id: string, messages: any, resolved: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(supportConversations).set({ messages, resolved }).where(eq(supportConversations.id, id));
}

