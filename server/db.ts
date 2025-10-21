import { eq, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  categories,
  productTags,
  twoFactorAuth,
  type Product,
  type Category,
  type ProductTag,
  type TwoFactorAuth,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORIES ============

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories);
}

export async function getSubcategoriesByParentId(parentId: string): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).where(eq(categories.parentId, parentId));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(
  data: Omit<typeof categories.$inferInsert, "id" | "createdAt" | "updatedAt">
): Promise<Category> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const result = await db
    .insert(categories)
    .values({ id, ...data })
    .$returningId();

  const created = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return created[0];
}

// ============ PRODUCT TAGS ============

export async function getTagsByCategory(categoryId: string): Promise<ProductTag[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(productTags).where(eq(productTags.categoryId, categoryId));
}

export async function createTag(
  data: Omit<typeof productTags.$inferInsert, "id" | "createdAt" | "updatedAt">
): Promise<ProductTag> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(productTags).values({ id, ...data });

  const created = await db
    .select()
    .from(productTags)
    .where(eq(productTags.id, id))
    .limit(1);

  return created[0];
}

// ============ PRODUCTS ============

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(products).where(eq(products.isActive, true));
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
}

export async function getProductsByTag(tagId: string): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(and(eq(products.tagId, tagId), eq(products.isActive, true)));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(
  data: Omit<typeof products.$inferInsert, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(products).values({ id, ...data });

  const created = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return created[0];
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<typeof products.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(products).set(data).where(eq(products.id, id));

  return await getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Soft delete - mark as inactive
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));

  return true;
}

// ============ 2FA ============

export async function getTwoFactorAuth(userId: string): Promise<TwoFactorAuth | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createTwoFactorAuth(
  userId: string,
  secret: string,
  backupCodes: string[]
): Promise<TwoFactorAuth> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `2fa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(twoFactorAuth).values({
    id,
    userId,
    secret,
    isEnabled: false,
    backupCodes: JSON.stringify(backupCodes),
  });

  const created = await db
    .select()
    .from(twoFactorAuth)
    .where(eq(twoFactorAuth.id, id))
    .limit(1);

  return created[0];
}

export async function enableTwoFactorAuth(userId: string): Promise<TwoFactorAuth | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(twoFactorAuth)
    .set({ isEnabled: true })
    .where(eq(twoFactorAuth.userId, userId));

  return await getTwoFactorAuth(userId);
}

export async function disableTwoFactorAuth(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(twoFactorAuth)
    .set({ isEnabled: false })
    .where(eq(twoFactorAuth.userId, userId));

  return true;
}



export async function deleteCategory(id: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Delete subcategories first
    await db.delete(categories).where(eq(categories.parentId, id));
    // Then delete the category itself
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  } catch (error) {
    console.error("Failed to delete category:", error);
    return false;
  }
}



export async function updateCategory(
  id: string,
  data: Partial<Omit<typeof categories.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(categories).set(data).where(eq(categories.id, id));

  return await getCategoryById(id);
}


// ============ USERS MANAGEMENT ============

export async function getAllUsers(): Promise<typeof users.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users);
}

export async function updateUserRole(userId: string, role: "admin" | "user"): Promise<typeof users.$inferSelect | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(users).set({ role }).where(eq(users.id, userId));

  return await getUser(userId);
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
}

// ============ AUTHENTICATION ============

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(
  email: string,
  password: string,
  name: string,
  role: "admin" | "user" = "user"
): Promise<typeof users.$inferSelect> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { hashPassword } = await import("./authHelper");
  const { generateUserId } = await import("./authHelper");

  const id = generateUserId();
  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id,
    email,
    password: hashedPassword,
    name,
    role,
    loginMethod: "email",
  });

  const created = await getUser(id);
  if (!created) throw new Error("Failed to create user");

  return created;
}
