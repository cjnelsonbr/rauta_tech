import { COOKIE_NAME } from "@shared/const";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  getSubcategoriesByParentId,
  createCategory,
  updateCategory,
  deleteCategory,
  getTwoFactorAuth,
  createTwoFactorAuth,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  getTagsByCategory,
  createTag,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserByEmail,
  createUserWithPassword,
  getDb,
} from "./db";
import { users } from "../drizzle/schema";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  verifyBackupCode,
} from "./twoFactorHelper";
import { verifyPassword } from "./authHelper";
import { TRPCError } from "@trpc/server";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can access this resource",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        
        if (!user || !user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha invalidos",
          });
        }
        
        const isPasswordValid = await verifyPassword(input.password, user.password);
        
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha invalidos",
          });
        }
        
        // Create session token
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.id, user.email || "");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),

    createUser: adminProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
          role: z.enum(["admin", "user"]).default("user"),
        })
      )
      .mutation(async ({ input }) => {
        const existingUser = await getUserByEmail(input.email);
        
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email ja cadastrado",
          });
        }
        
        return await createUserWithPassword(
          input.email,
          input.password,
          input.name,
          input.role
        );
      }),

    updatePassword: adminProcedure
      .input(z.object({ userId: z.string(), password: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const { hashPassword } = await import("./authHelper");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const hashedPassword = await hashPassword(input.password);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.id, input.userId));
        
        return { success: true };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(async () => {
      return await getAllCategories();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getCategoryBySlug(input.slug);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getCategoryById(input.id);
      }),

    getSubcategories: publicProcedure
      .input(z.object({ parentId: z.string() }))
      .query(async ({ input }) => {
        return await getSubcategoriesByParentId(input.parentId);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          parentId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createCategory(input);
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateCategory(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const success = await deleteCategory(input.id);
        return { success };
      }),
  }),

  // ============ TAGS ============
  tags: router({
    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        return await getTagsByCategory(input.categoryId);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          categoryId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await createTag(input);
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: publicProcedure.query(async () => {
      return await getAllProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),

    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        return await getProductsByCategory(input.categoryId);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().int().positive(),
          categoryId: z.string(),
          imageUrl: z.string().url().optional().or(z.literal("")),
          customMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createProduct({
          name: input.name,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId,
          imageUrl: input.imageUrl,
          customMessage: input.customMessage,
          isActive: true,
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().int().positive().optional(),
          categoryId: z.string().optional(),
          imageUrl: z.string().url().optional().or(z.literal("")),
          customMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateProduct(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await deleteProduct(input.id);
      }),
  }),

  // ============ 2FA ============
  twoFactor: router({
    // Get current 2FA status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const twoFa = await getTwoFactorAuth(ctx.user.id);
      return {
        isEnabled: twoFa?.isEnabled ?? false,
        hasBackupCodes: twoFa ? (twoFa.backupCodes ? JSON.parse(twoFa.backupCodes).length : 0) : 0,
      };
    }),

    // Generate new 2FA secret
    generateSecret: protectedProcedure.mutation(async ({ ctx }) => {
      const secret = await generateTwoFactorSecret(ctx.user.email || ctx.user.id);

      // Store the secret (but not enabled yet)
      await createTwoFactorAuth(ctx.user.id, secret.secret, secret.backupCodes);

      return {
        secret: secret.secret,
        qrCodeUrl: secret.qrCodeUrl,
        backupCodes: secret.backupCodes,
      };
    }),

    // Verify and enable 2FA
    verify: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const twoFa = await getTwoFactorAuth(ctx.user.id);

        if (!twoFa) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "2FA secret not found. Generate one first.",
          });
        }

        const isValid = verifyTwoFactorToken(twoFa.secret, input.token);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        // Enable 2FA
        await enableTwoFactorAuth(ctx.user.id);

        return { success: true };
      }),

    // Disable 2FA
    disable: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const twoFa = await getTwoFactorAuth(ctx.user.id);

        if (!twoFa || !twoFa.isEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "2FA is not enabled",
          });
        }

        const isValid = verifyTwoFactorToken(twoFa.secret, input.token);

        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification code",
          });
        }

        await disableTwoFactorAuth(ctx.user.id);

        return { success: true };
      }),

    // Verify with backup code
    verifyBackupCode: publicProcedure
      .input(z.object({ userId: z.string(), code: z.string() }))
      .mutation(async ({ input }) => {
        const twoFa = await getTwoFactorAuth(input.userId);

        if (!twoFa || !twoFa.isEnabled) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "2FA is not enabled",
          });
        }

        const backupCodes = twoFa.backupCodes ? JSON.parse(twoFa.backupCodes) : [];
        const { valid, remainingCodes } = verifyBackupCode(backupCodes, input.code);

        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid backup code",
          });
        }

        // Update remaining backup codes
        await updateProduct(input.userId, {});

        return { success: true };
      }),
  }),

  // ============ USERS MANAGEMENT ============
  users: router({
    list: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    updateRole: adminProcedure
      .input(z.object({ userId: z.string(), role: z.enum(["admin", "user"]) }))
      .mutation(async ({ input }) => {
        return await updateUserRole(input.userId, input.role);
      }),

    delete: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ input }) => {
        return await deleteUser(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

