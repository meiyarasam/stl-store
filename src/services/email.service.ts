import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "The Print Factory <theprintfactory2026@gmail.com>";

export const isResendConfigured = Boolean(
  resendApiKey && !resendApiKey.includes("placeholder")
);

export const resend = isResendConfigured ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isResendConfigured || !resend) {
    console.log(`📧 [Development Email Logger] To: ${to} | Subject: ${subject}`);
    return { success: true, id: `dev_email_${Date.now()}` };
  }

  try {
    const data = await resend.emails.send({
      from: resendFromEmail,
      to,
      subject,
      html,
    });

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error("Failed to send email via Resend:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}

export function generateOrderConfirmationEmail({
  customerName,
  orderNumber,
  items,
  total,
  currency,
  downloadUrl,
}: {
  customerName: string;
  orderNumber: string;
  items: { title: string; price: string }[];
  total: string;
  currency: string;
  downloadUrl: string;
}): string {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">
        ${item.title}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 600;">
        ${item.price}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - The Print Factory</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
        <table align="center" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="text-align: center; padding-bottom: 24px; border-bottom: 2px solid #2563eb;">
              <h1 style="margin: 0; font-size: 24px; color: #0f172a; letter-spacing: -0.5px;">THE PRINT <span style="color: #2563eb;">FACTORY</span></h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">BUY. PRINT. RELAX.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0 16px 0;">
              <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Payment Confirmed & Files Ready!</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Hi ${customerName},<br>
                Thank you for your purchase. Your digital 3D models are now unlocked and available for instant download in your The Print Factory account.
              </p>
              <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #334155;">
                  <strong>Order ID:</strong> #${orderNumber}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" style="border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 8px; color: #64748b; font-size: 13px; text-transform: uppercase;">Product</th>
                    <th style="text-align: right; padding-bottom: 8px; color: #64748b; font-size: 13px; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 16px 0 8px 0; font-weight: bold; color: #0f172a;">Total Paid</td>
                    <td style="padding: 16px 0 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: #0f172a;">${total} ${currency}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0 20px 0; text-align: center;">
              <a href="${downloadUrl}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">
                Download Your 3D STL Files
              </a>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #e2e8f0; padding-top: 24px; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
              The Print Factory – International Digital 3D Printing Marketplace.<br>
              Need help? Contact theprintfactory2026@gmail.com
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

