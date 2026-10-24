import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { productsList } from '@/components/consumer-market/data/mockData';

export async function POST(request: Request) {
  try {
    const { prompt, history, selectedProductIds } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '请提供咨询内容' }, { status: 400 });
    }

    const availableProducts = productsList.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.formattedPrice,
      shortDescription: p.shortDescription,
    }));

    // Find any direct matches from products
    const matchedProducts = productsList.filter((p) => {
      const q = prompt.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    });

    const matchedProductIds = (
      matchedProducts.length > 0
        ? matchedProducts.map((p) => p.id)
        : (selectedProductIds?.length ? selectedProductIds : [productsList[0].id, productsList[1].id])
    ).slice(0, 3);

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI();
        const systemInstruction = `You are "Zarg 4.0", an ultra-sleek, minimalist AI assistant capable of image creation brainstorming, photo editing guidance, voice dialogue, and smart assistance.
Respond concisely, elegantly, and helpfully (within 2-3 sentences), in the language the user spoke to you.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }],
            },
          ],
        });

        const replyText = response.text || '';
        if (replyText.trim()) {
          return NextResponse.json({
            text: replyText.trim(),
            styleTag: 'Super AI',
            matchedProductIds,
          });
        }
      } catch (err) {
        console.warn('Gemini API call failed, using graceful fallback:', err);
      }
    }

    // Graceful intelligent fallback
    let fallbackText = `Tomorrow’s forecast is looking great! It’ll be mostly sunny throughout the day with a high of 28°C and a low of 19°C. Sounds like a good day for that workout!`;
    let styleTag = 'Weather & AI';

    const p = prompt.toLowerCase();
    if (p.includes('weather') || p.includes('forecast') || p.includes('rain') || p.includes('sunny') || p.includes('天气') || p.includes('下雨') || p.includes('气温')) {
      fallbackText = `The weather looks delightful tomorrow: clear skies with comfortable humidity, around 24°C–28°C. Perfect for outdoor activities or heading out!`;
    } else if (p.includes('gym') || p.includes('workout') || p.includes('fitness') || p.includes('健身') || p.includes('运动')) {
      fallbackText = `A great workout plan for tomorrow! Remember to stay hydrated and warm up properly before hitting your heavy sets.`;
    } else if (p.includes('穿搭') || p.includes('衣服') || p.includes('风格')) {
      fallbackText = `建议以干净简洁的剪裁为主，注重面料垂坠感与质感，搭配同色系或微反差单品，轻松打造具有松弛感的高级日常穿搭。`;
      styleTag = '风格搭配';
    } else if (p.includes('空间') || p.includes('家具') || p.includes('灯') || p.includes('椅')) {
      fallbackText = `营造空间美学的核心在于层次光影与自然材质的呼吸感。选一盏有设计感的漫反射灯具或形态舒展的单人椅，能瞬间点亮整个房间的视觉重心。`;
      styleTag = '空间美学';
    } else if (prompt.trim()) {
      fallbackText = `Got it! I've noted that down. Tomorrow is forecasted to be warm and clear (28°C/19°C). Let me know if you need any more tips or plans!`;
    }

    return NextResponse.json({
      text: fallbackText,
      styleTag,
      matchedProductIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理请求失败' },
      { status: 500 }
    );
  }
}
