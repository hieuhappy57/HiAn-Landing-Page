import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mood, menuList } = req.body;
  if (!mood || !menuList || !Array.isArray(menuList)) {
    return res.status(400).json({ error: 'Invalid input parameters' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server' });
  }

  try {
    const formatPrice = (price: number) => `${(price / 1000)}k`;
    const menuText = menuList.map((item: any) => `${item.id}: ${item.name} (${formatPrice(item.price)}) - ${item.description}`).join(", ");
    const promptText = `Khách đang cảm thấy: "${mood}". \nThực đơn: [${menuText}]. \nHãy chọn 1 ID món phù hợp nhất để giới thiệu.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "Bạn là một nhân viên pha chế (barista) thân thiện, thấu cảm tại quán cafe HiAn Matcha & Coco ở Đà Nẵng, Việt Nam. Hãy đọc tâm trạng của khách, chọn 1 món uống phù hợp nhất dựa trên mô tả. Phản hồi bằng ngôn ngữ của khách nhập (Tiếng Việt hoặc Tiếng Anh) với giọng điệu dễ thương, gen Z, dùng emoji.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drinkId: { type: Type.STRING },
            message: { type: Type.STRING, description: "Lời nhắn của barista" }
          },
          required: ["drinkId", "message"]
        }
      }
    });

    const responseText = response.text;
    if (responseText) {
      const parsedData = JSON.parse(responseText);
      return res.status(200).json(parsedData);
    } else {
      return res.status(500).json({ error: "Empty response from Gemini API" });
    }
  } catch (err: any) {
    console.error("Gemini server error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate AI suggestion" });
  }
}
