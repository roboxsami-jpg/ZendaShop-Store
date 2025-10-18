import { execSync } from "child_process";

const PAYPAL_BUSINESS_EMAIL = "Ousghirsamibn@gmail.com";

export async function createPayPalInvoice(
  productName: string,
  amount: number,
  customerEmail: string
) {
  try {
    const result = execSync(
      `manus-mcp-cli tool call create_invoice --server paypal-for-business --input '{"business_email":"${PAYPAL_BUSINESS_EMAIL}","product_name":"${productName}","amount_value":${amount}}'`,
      { encoding: "utf-8" }
    );

    // Parse the result to extract the invoice link
    const invoiceMatch = result.match(/https:\/\/[^\s]+/);
    const invoiceLink = invoiceMatch ? invoiceMatch[0] : null;

    return {
      success: true,
      invoiceLink,
      message: "Invoice created successfully",
    };
  } catch (error) {
    console.error("PayPal invoice creation error:", error);
    return {
      success: false,
      message: "Failed to create PayPal invoice",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createPayPalCart(
  productId: string,
  quantity: number,
  recipientEmail: string
) {
  try {
    const result = execSync(
      `manus-mcp-cli tool call create_cart --server paypal-for-business --input '{"productId":"${productId}","quantity":${quantity},"recipient_email":"${recipientEmail}"}'`,
      { encoding: "utf-8" }
    );

    const cartMatch = result.match(/cart[_-]?id["\s:]+([^\s"]+)/i);
    const cartId = cartMatch ? cartMatch[1] : null;

    return {
      success: true,
      cartId,
      message: "Cart created successfully",
    };
  } catch (error) {
    console.error("PayPal cart creation error:", error);
    return {
      success: false,
      message: "Failed to create PayPal cart",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function completePayPalCart(cartId: string) {
  try {
    const result = execSync(
      `manus-mcp-cli tool call complete_cart --server paypal-for-business --input '{"cart_id":"${cartId}"}'`,
      { encoding: "utf-8" }
    );

    const paymentLink = result.match(/https:\/\/[^\s]+/)?.[0] || null;

    return {
      success: true,
      paymentLink,
      message: "Cart completed successfully",
    };
  } catch (error) {
    console.error("PayPal cart completion error:", error);
    return {
      success: false,
      message: "Failed to complete PayPal cart",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

