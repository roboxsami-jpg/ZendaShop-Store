import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { v4 as uuidv4 } from "uuid";
import { invokeLLM } from "./_core/llm";
import * as paypal from "./paypal";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product routes
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
  }),

  // Cart routes
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      // Enrich with product data
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return { ...item, product };
        })
      );
      return enrichedItems;
    }),

    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
          selectedColor: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = uuidv4();
        return await db.addToCart({
          id,
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
          selectedColor: input.selectedColor,
        });
      }),

    removeItem: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.id);
        return { success: true };
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ id: z.string(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await db.updateCartItem(input.id, input.quantity);
        return { success: true };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Order routes
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          items: z.array(z.any()),
          totalAmount: z.number(),
          paymentMethod: z.string(),
          paymentId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = uuidv4();
        const order = await db.createOrder({
          id,
          userId: ctx.user.id,
          totalAmount: input.totalAmount,
          paymentMethod: input.paymentMethod,
          paymentId: input.paymentId,
          items: input.items,
          status: "pending",
        });
        // Clear cart after order
        await db.clearCart(ctx.user.id);
        return order;
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (order && order.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return order;
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.string(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (order && order.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        await db.updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // PayPal routes
  paypal: router({
    createInvoice: protectedProcedure
      .input(
        z.object({
          productName: z.string(),
          amount: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await paypal.createPayPalInvoice(
          input.productName,
          input.amount,
          ctx.user.email || ""
        );
      }),
  }),

  // Support routes with AI
  support: router({
    startConversation: protectedProcedure
      .input(
        z.object({
          productId: z.string().optional(),
          initialMessage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const id = uuidv4();
        const messages = [
          { role: "user", content: input.initialMessage, timestamp: new Date() },
        ];

        // Get AI response
        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful customer support assistant for Zenda Shop. Be friendly, professional, and helpful. Answer questions about products, orders, and policies.",
            },
            { role: "user", content: input.initialMessage },
          ],
        });

        const assistantMessage = typeof aiResponse.choices[0].message.content === 'string' ? aiResponse.choices[0].message.content : JSON.stringify(aiResponse.choices[0].message.content);
        messages.push({
          role: "assistant",
          content: assistantMessage as any,
          timestamp: new Date(),
        });

        const conversation = await db.createSupportConversation({
          id,
          userId: ctx.user.id,
          productId: input.productId,
          messages,
          resolved: false,
        });

        return conversation;
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.string(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getSupportConversationById(
          input.conversationId
        );
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const messages = (conversation.messages as any[]) || [];
        messages.push({
          role: "user",
          content: input.message,
          timestamp: new Date(),
        });

        // Get AI response
        const aiResponse = await invokeLLM({
          messages: messages.map((m) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          })),
        });

        const assistantMessage = typeof aiResponse.choices[0].message.content === 'string' ? aiResponse.choices[0].message.content : JSON.stringify(aiResponse.choices[0].message.content);
        messages.push({
          role: "assistant",
          content: assistantMessage as any,
          timestamp: new Date(),
        });

        await db.updateSupportConversation(
          input.conversationId,
          messages,
          false
        );

        return { success: true, message: assistantMessage };
      }),

    getConversation: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getSupportConversationById(input.id);
        if (conversation && conversation.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return conversation;
      }),

    getMyConversations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSupportConversations(ctx.user.id);
    }),

    closeConversation: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getSupportConversationById(input.id);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        await db.updateSupportConversation(input.id, conversation.messages, true);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

