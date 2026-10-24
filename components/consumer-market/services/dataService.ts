import {
  ProductItem,
  CartItem,
  Exhibition,
  ScenePost,
  Story,
  Creator,
  QnaMessage,
  AiChatMessage,
} from '../types';
import {
  productsList,
  exhibitionsList,
  scenePostsList,
  sampleCreator,
  sampleStory,
  lampProduct,
  keyboardProduct,
} from '../data/mockData';

const STORAGE_KEYS = {
  CART: 'omnilink_cart_items_v1',
  SAVED: 'omnilink_saved_items_v1',
  QNA: 'omnilink_qna_history_v1',
  AI_CHAT: 'omnilink_ai_chat_v4',
};

let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('omnilink_realtime_sync');
  }
} catch {
  syncChannel = null;
}

export class DataService {
  static getProducts(): ProductItem[] {
    return productsList;
  }

  static getProductById(id: string): ProductItem | undefined {
    return productsList.find((p) => p.id === id);
  }

  static searchProducts(query: string, products: ProductItem[] = productsList): ProductItem[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.creator.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q)
    );
  }

  static getExhibitions(): Exhibition[] {
    return exhibitionsList;
  }

  static getScenePosts(): ScenePost[] {
    return scenePostsList;
  }

  static getCreator(): Creator {
    return sampleCreator;
  }

  static getStory(): Story {
    return sampleStory;
  }

  static getCart(products: ProductItem[] = productsList, useOnlyProvidedProducts = false): CartItem[] {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.CART);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const productIds = new Set(products.map((product) => product.id));
            return parsed.filter((item): item is CartItem => item?.product && productIds.has(item.product.id));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
    if (useOnlyProvidedProducts) return [];
    return [
      { product: lampProduct, quantity: 1, variant: 'Brushed Brass' },
      { product: keyboardProduct, quantity: 1, variant: 'Dual Dial TKL' },
    ];
  }

  static saveCart(items: CartItem[]): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
      }
      if (syncChannel) {
        syncChannel.postMessage({ type: 'CART_UPDATED', payload: items });
      }
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  }

  static getSavedProductIds(): string[] {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.SAVED);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return ['p_lamp_01', 'p_chair_02', 'p_keyboard_07', 'p_headphones_06'];
  }

  static saveProductIds(ids: string[]): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(ids));
      }
      if (syncChannel) {
        syncChannel.postMessage({ type: 'SAVED_UPDATED', payload: ids });
      }
    } catch {
      // ignore
    }
  }

  static getQnaHistory(): Record<string, QnaMessage[]> {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.QNA);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      p_lamp_01: [
        {
          id: 'q1',
          text: '底座占地与光线色温如何？',
          isUser: false,
          evidenceText: '实测底座直径18cm，搭载2700K无频闪调光光源。',
          timestamp: '官方认证',
        },
      ],
    };
  }

  static saveQnaHistory(history: Record<string, QnaMessage[]>): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.QNA, JSON.stringify(history));
      }
    } catch {
      // ignore
    }
  }

  static getAiChatHistory(): AiChatMessage[] {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
        if (stored) {
          let conversationId = '';
          return (JSON.parse(stored) as AiChatMessage[]).map((message) => {
            if (message.id === 'msg_welcome') return message;
            if (message.conversationId) conversationId = message.conversationId;
            else if (message.isUser) conversationId = message.id;
            return { ...message, conversationId: conversationId || message.id };
          });
        }
      }
    } catch {
      // ignore
    }
    const defaultConvId = 'conv_gym_weather';
    return [
      {
        id: 'msg_gym_weather_user',
        conversationId: defaultConvId,
        text: 'I want to hit the gym. What’s the weather like tomorrow?',
        isUser: true,
        timestamp: '刚刚',
      },
      {
        id: 'msg_gym_weather_ai',
        conversationId: defaultConvId,
        text: 'Tomorrow’s forecast is looking great! It’ll be mostly sunny throughout the day with a high of 28°C and a low of 19°C. Sounds like a good day for that workout!',
        isUser: false,
        timestamp: '刚刚',
      },
    ];
  }

  static saveAiChatHistory(messages: AiChatMessage[]): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }

  static getReplacementOptions(currentProductId: string): ProductItem[] {
    return productsList.filter((p) => p.id !== currentProductId);
  }

  static generateQnaAnswer(question: string, product: ProductItem): { answer: string; evidence: string } {
    const q = question.toLowerCase();
    if (!productsList.some((sample) => sample.id === product.id)) {
      const matchingSpec = Object.entries(product.specs).find(([key]) =>
        q.includes(key.toLowerCase()) ||
        (/(尺寸|size|dimension)/i.test(q) && /(尺寸|长|宽|高|size|dimension)/i.test(key)) ||
        (/(材质|材料|material)/i.test(q) && /(材质|材料|material)/i.test(key)) ||
        (/(颜色|color)/i.test(q) && /(颜色|color)/i.test(key))
      );
      if (matchingSpec) {
        return {
          answer: `商品资料中，${matchingSpec[0]}为：${matchingSpec[1]}。`,
          evidence: `${matchingSpec[0]}：${matchingSpec[1]}`,
        };
      }
      if (product.shortDescription.trim()) {
        return {
          answer: `目前商家提供的商品说明是：${product.shortDescription}`,
          evidence: product.shortDescription,
        };
      }
      return {
        answer: '当前商品资料没有包含这个问题的答案，建议在询价时请商家确认。',
        evidence: '商品详情尚未提供相关字段。',
      };
    }
    if (q.includes('desk') || q.includes('小') || q.includes('尺寸') || q.includes('size')) {
      const dims = product.specs['Dimensions'] || product.specs['尺寸'] || '紧凑占地';
      return {
        answer: `该单品适合紧凑空间布置。具体尺寸：${dims}。底部配有防刮保护缓冲垫。`,
        evidence: `实测尺寸：${dims}。`,
      };
    }
    if (q.includes('光') || q.includes('灯') || q.includes('色温') || q.includes('led')) {
      return {
        answer: '配备 2700K 暖光集成 LED，支持顺滑无级调光，营造安静舒适的空间氛围。',
        evidence: '经过工作室光学校准认证。',
      };
    }
    return {
      answer: '以建筑级精工标准打磨，现货支持安全配送与 14 天退换保障。',
      evidence: '工作室现货质检保障。',
    };
  }

  static subscribeToSync(callback: (event: { type: string; payload: unknown }) => void): () => void {
    if (syncChannel) {
      const handler = (event: MessageEvent) => {
        callback(event.data);
      };
      syncChannel.addEventListener('message', handler);
      return () => {
        syncChannel?.removeEventListener('message', handler);
      };
    }
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CART && e.newValue) {
        callback({ type: 'CART_UPDATED', payload: JSON.parse(e.newValue) });
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }
}
