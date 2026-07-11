export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderText, customer, items, total } = req.body;
  if (!orderText || !customer) {
    return res.status(400).json({ error: 'Missing order details or customer information' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Resend API Key is not configured on Vercel Dashboard");
    return res.status(200).json({ success: false, message: 'Resend API Key is not configured' });
  }

  const receiverEmail = process.env.RECEIVER_EMAIL || 'hianmatcha@gmail.com';
  const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

  // Format order details as clean HTML table
  const formatPrice = (price: number) => `${(price / 1000)}k`;
  let itemsHtml = '';
  if (Array.isArray(items)) {
    itemsHtml = items.map((item: any) => {
      const toppingText = item.selectedToppings && item.selectedToppings.length > 0 
        ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">+ Toppings: ${item.selectedToppings.join(', ')}</div>` 
        : '';
      const extraText = item.selectedExtra && item.selectedExtra.length > 0 
        ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">+ Tùy chọn: ${item.selectedExtra.join(', ')}</div>` 
        : '';
      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:12px 8px;font-size:14px;color:#1e293b;vertical-align:top;">
            <div style="font-weight:600;">${item.name} <span style="color:#64748b;font-weight:normal;">x${item.quantity}</span></div>
            ${toppingText}
            ${extraText}
          </td>
          <td style="padding:12px 8px;text-align:right;font-weight:600;font-size:14px;color:#1e293b;vertical-align:top;width:80px;">
            ${formatPrice(item.totalPrice * item.quantity)}
          </td>
        </tr>
      `;
    }).join('');
  }

  const htmlContent = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background-color:#ffffff;">
      <div style="text-align:center;margin-bottom:24px;border-bottom:1px solid #f1f5f9;padding-bottom:16px;">
        <h2 style="color:#5d821a;margin:0;font-size:24px;font-weight:800;">HiAn Matcha & Coco</h2>
        <p style="color:#64748b;margin:4px 0 0 0;font-size:14px;">Thông báo đơn hàng mới từ website</p>
      </div>
      
      <div style="background-color:#f8fafc;padding:16px;border-radius:12px;margin-bottom:24px;border:1px solid #f1f5f9;">
        <h3 style="margin:0 0 12px 0;font-size:15px;color:#0f172a;font-weight:700;">Thông tin khách hàng:</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#64748b;width:110px;vertical-align:top;">Họ tên:</td>
            <td style="padding:6px 0;font-weight:600;color:#1e293b;vertical-align:top;">${customer.name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;vertical-align:top;">Số điện thoại:</td>
            <td style="padding:6px 0;font-weight:600;color:#1e293b;vertical-align:top;">${customer.phone}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;vertical-align:top;">Địa chỉ:</td>
            <td style="padding:6px 0;font-weight:600;color:#1e293b;vertical-align:top;">${customer.address}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;vertical-align:top;">Lưu ý:</td>
            <td style="padding:6px 0;font-weight:600;color:#1e293b;vertical-align:top;">${customer.note || 'Không có'}</td>
          </tr>
        </table>
      </div>

      <h3 style="margin:0 0 8px 0;font-size:15px;color:#0f172a;font-weight:700;border-bottom:2px solid #5d821a;padding-bottom:6px;">Chi tiết món nước:</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:16px 8px;font-weight:800;font-size:16px;color:#1e293b;">TỔNG CỘNG:</td>
            <td style="padding:16px 8px;text-align:right;font-weight:800;font-size:18px;color:#5d821a;">${formatPrice(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;font-size:12px;color:#94a3b8;font-style:italic;">
        Đơn hàng này được tự động gửi từ Landing Page HiAn.
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `HiAn Orders <${senderEmail}>`,
        to: receiverEmail,
        subject: `🔔 ĐƠN HÀNG MỚI từ ${customer.name} - ${formatPrice(total)}`,
        html: htmlContent
      })
    });

    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, data });
    } else {
      console.error("Resend API error response:", data);
      return res.status(response.status).json({ success: false, error: data });
    }
  } catch (err: any) {
    console.error("Resend Server Error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to send email" });
  }
}
