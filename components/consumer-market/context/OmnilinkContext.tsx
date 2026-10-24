import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  ProductItem,
  CartItem,
  Exhibition,
  ScenePost,
  Story,
  Creator,
  FeedItem,
  MainTab,
  PersonalSubTab,
  ProfileTab,
  QnaMessage,
  AiChatMessage,
  ConsumerAiModel,
} from '../types';
import { DataService } from '../services/dataService';
import { feedItemsList } from '../data/mockData';

interface OmnilinkContextType {
  // Navigation & Tabs
  mainTab: MainTab;
  selectTab: (tab: MainTab) => void;
  personalSubTab: PersonalSubTab;
  setPersonalSubTab: (subTab: PersonalSubTab) => void;
  profileTab: ProfileTab;
  setProfileTab: (tab: ProfileTab) => void;

  // Repositories
  products: ProductItem[];
  feedItems: FeedItem[];
  scenePosts: ScenePost[];
  exhibitions: Exhibition[];
  creator: Creator;
  story: Story;

  // Active Overlays
  selectedFloatingProduct: ProductItem | null;
  openFloatingProduct: (product: ProductItem) => void;
  closeFloatingProduct: () => void;

  currentProductDetail: ProductItem | null;
  openProductDetail: (product: ProductItem) => void;
  closeProductDetail: () => void;

  currentScenePost: ScenePost | null;
  currentSceneIndex: number;
  openScenePost: (scenePost: ScenePost) => void;
  closeScenePost: () => void;
  nextScenePost: () => void;
  prevScenePost: () => void;

  currentExhibition: Exhibition | null;
  openExhibition: (exhibition: Exhibition) => void;
  closeExhibition: () => void;

  openStore: (product: ProductItem) => void;

  currentStory: Story | null;
  openStory: (story: Story) => void;
  closeStory: () => void;

  currentCreator: Creator | null;
  openCreator: (creator: Creator) => void;
  closeCreator: () => void;

  // Search
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  searchResults: ProductItem[];
  updateSearchQuery: (query: string) => void;

  // Reviews
  isReviewsOpen: boolean;
  openReviews: () => void;
  closeReviews: () => void;

  // Cart & Comparison
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: ProductItem, variant?: string, selectedOptions?: Record<string, string>) => void;
  addMultipleToCart: (products: ProductItem[]) => void;
  updateCartQuantity: (productId: string, delta: number, variantId?: string | null) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  cartComparisonPair: [ProductItem, ProductItem] | null;
  startCartComparison: (p1: ProductItem, p2: ProductItem) => void;
  closeCartComparison: () => void;

  // AI Conversational Image & Intent Reasoning
  aiMessages: AiChatMessage[];
  activeAiConversationId: string;
  archivedAiConversationIds: string[];
  selectAiConversation: (id: string) => void;
  startAiConversation: () => void;
  archiveAiConversation: (id: string) => void;
  deleteAiConversation: (id: string) => void;
  isAiThinking: boolean;
  aiModel: ConsumerAiModel;
  setAiModel: (model: ConsumerAiModel) => void;
  sendAiMessage: (prompt: string, selectedProductIds?: string[]) => void;
  sendAiImageMessage: (imageSrc: string, promptText?: string, selectedProductIds?: string[]) => void;
  deleteMatchedItem: (messageId: string, productId: string) => void;
  replaceMatchedItem: (messageId: string, oldProductId: string, newProduct: ProductItem) => void;
  openAiPage: (initialPrompt?: string, initialImage?: string) => void;

  // Q&A
  qnaHistory: Record<string, QnaMessage[]>;
  askProductQna: (productId: string, question: string) => void;

  // Toast & Notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Saved / Liked items
  savedProductIds: string[];
  toggleSaveProduct: (productId: string) => void;
}

const OmnilinkContext = createContext<OmnilinkContextType | undefined>(undefined);

export const OmnilinkProvider: React.FC<{
  children: React.ReactNode;
  initialProducts?: ProductItem[];
  initialPosts?: ScenePost[];
  hasLiveProducts?: boolean;
  initialWelcome?: boolean;
  initialTab?: MainTab;
  initialSearch?: boolean;
}> = ({
  children,
  initialProducts = [],
  initialPosts = [],
  hasLiveProducts = false,
  initialWelcome = false,
  initialTab,
  initialSearch = false,
}) => {
  const router = useRouter();
  // Main Tab State
  const [mainTab, setMainTab] = useState<MainTab>(initialTab ?? (initialWelcome ? 'PERSONAL' : 'WORLD'));
  const [personalSubTab, setPersonalSubTab] = useState<PersonalSubTab>('AI');
  const [profileTab, setProfileTab] = useState<ProfileTab>('CART');

  // Repositories
  const [products] = useState<ProductItem[]>(() => hasLiveProducts ? initialProducts : (initialProducts.length ? initialProducts : DataService.getProducts()));
  const [feedItems] = useState<FeedItem[]>(() => {
    if (hasLiveProducts) {
      const mixed: FeedItem[] = initialProducts.map((product) => ({ type: 'product', product }));
      initialPosts.forEach((scenePost, index) => mixed.splice(Math.min(index * 3, mixed.length), 0, { type: 'scene', scenePost }));
      return mixed;
    }
    if (!initialProducts.length) return feedItemsList;
    const curatedScenes = feedItemsList.filter((item) => item.type === 'scene');
    return initialProducts.flatMap((product, index) => [
      { type: 'product' as const, product },
      ...(index % 3 === 1 && curatedScenes.length ? [curatedScenes[Math.floor(index / 3) % curatedScenes.length]] : []),
    ]);
  });
  const [scenePosts] = useState<ScenePost[]>(() => {
    if (hasLiveProducts) return initialPosts;
    const posts = DataService.getScenePosts();
    return hasLiveProducts ? posts.map((post) => ({ ...post, linkedProducts: [] })) : posts;
  });
  const [exhibitions] = useState<Exhibition[]>(() => {
    if (hasLiveProducts) return [];
    const items = DataService.getExhibitions();
    return hasLiveProducts
      ? items.map((exhibition) => ({
          ...exhibition,
          chapters: exhibition.chapters.map((chapter) => ({ ...chapter, taggedProducts: [] })),
        }))
      : items;
  });
  const [creator] = useState<Creator>(() => DataService.getCreator());
  const [story] = useState<Story>(() => DataService.getStory());

  // Overlays
  const [selectedFloatingProduct, setSelectedFloatingProduct] = useState<ProductItem | null>(null);
  const [currentProductDetail, setCurrentProductDetail] = useState<ProductItem | null>(null);
  const [currentScenePost, setCurrentScenePost] = useState<ScenePost | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [currentExhibition, setCurrentExhibition] = useState<Exhibition | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentCreator, setCurrentCreator] = useState<Creator | null>(null);

  // Search & Reviews
  const [isSearchOpen, setIsSearchOpen] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>(() => DataService.getCart(products, initialProducts.length > 0));
  const [cartComparisonPair, setCartComparisonPair] = useState<[ProductItem, ProductItem] | null>(null);

  // Saved Products
  const [savedProductIds, setSavedProductIds] = useState<string[]>(() =>
    DataService.getSavedProductIds()
  );

  // Q&A & AI Chat
  const [qnaHistory, setQnaHistory] = useState<Record<string, QnaMessage[]>>(() =>
    DataService.getQnaHistory()
  );
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(() =>
    DataService.getAiChatHistory()
  );
  const [activeAiConversationId, setActiveAiConversationId] = useState(() => DataService.getAiChatHistory().at(-1)?.conversationId || crypto.randomUUID());
  const [archivedAiConversationIds, setArchivedAiConversationIds] = useState<string[]>(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('omnilink-eva-archived-conversations') || '[]') as string[]; }
    catch { return []; }
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiModel, setAiModel] = useState<ConsumerAiModel>('gemini');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time synchronization across browser tabs
  useEffect(() => {
    const unsubscribe = DataService.subscribeToSync((event) => {
      if (event.type === 'CART_UPDATED') {
        setCartItems(event.payload as CartItem[]);
      } else if (event.type === 'SAVED_UPDATED') {
        setSavedProductIds(event.payload as string[]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    DataService.saveCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    DataService.saveProductIds(savedProductIds);
  }, [savedProductIds]);

  useEffect(() => {
    DataService.saveQnaHistory(qnaHistory);
  }, [qnaHistory]);

  useEffect(() => {
    DataService.saveAiChatHistory(aiMessages);
  }, [aiMessages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.setItem('omnilink-eva-archived-conversations', JSON.stringify(archivedAiConversationIds));
    }
  }, [archivedAiConversationIds]);

  const startAiConversation = useCallback(() => setActiveAiConversationId(crypto.randomUUID()), []);
  const selectAiConversation = useCallback((id: string) => {
    setArchivedAiConversationIds((current) => current.filter((item) => item !== id));
    setActiveAiConversationId(id);
  }, []);
  const archiveAiConversation = useCallback((id: string) => {
    setArchivedAiConversationIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setActiveAiConversationId((current) => current === id ? crypto.randomUUID() : current);
  }, []);
  const deleteAiConversation = useCallback((id: string) => {
    setAiMessages((current) => current.filter((message) => message.conversationId !== id));
    setArchivedAiConversationIds((current) => current.filter((item) => item !== id));
    setActiveAiConversationId((current) => current === id ? crypto.randomUUID() : current);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Cart Actions
  const addToCart = useCallback(
    (product: ProductItem, variant: string = '标准', selectedOptions?: Record<string, string>) => {
      setCartItems((prev) => {
        const variantId = product.defaultVariantId ?? null;
        const existingIdx = prev.findIndex((i) => i.product.id === product.id && (i.variantId ?? i.product.defaultVariantId ?? null) === variantId);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + 1,
          };
          return updated;
        }
        return [...prev, { product, quantity: 1, variant, variantId, selectedOptions }];
      });
      showToast(`已将 ${product.name} 加入购物车`);
    },
    [showToast]
  );

  const addMultipleToCart = useCallback(
    (productsToAdd: ProductItem[]) => {
      if (productsToAdd.length === 0) return;
      setCartItems((prev) => {
        const updated = [...prev];
        productsToAdd.forEach((product) => {
          const idx = updated.findIndex((i) => i.product.id === product.id && (i.variantId ?? i.product.defaultVariantId ?? null) === (product.defaultVariantId ?? null));
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              quantity: updated[idx].quantity + 1,
            };
          } else {
            updated.push({ product, quantity: 1, variant: '标准', variantId: product.defaultVariantId ?? null });
          }
        });
        return updated;
      });
      showToast(`已批量添加 ${productsToAdd.length} 件商品至购物车`);
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, delta: number, variantId?: string | null) => {
      setCartItems((prev) =>
        prev
          .map((item) => {
            if (item.product.id === productId && (variantId === undefined || (item.variantId ?? item.product.defaultVariantId ?? null) === variantId)) {
              const newQty = item.quantity + delta;
              return newQty <= 0 ? null : { ...item, quantity: newQty };
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    []
  );

  const removeFromCart = useCallback((productId: string, variantId?: string | null) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId || (variantId !== undefined && (i.variantId ?? i.product.defaultVariantId ?? null) !== variantId)));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Overlays
  const openFloatingProduct = useCallback((product: ProductItem) => {
    setSelectedFloatingProduct(product);
  }, []);

  const closeFloatingProduct = useCallback(() => {
    setSelectedFloatingProduct(null);
  }, []);

  const openProductDetail = useCallback((product: ProductItem) => {
    setSelectedFloatingProduct(null);
    setCurrentProductDetail(product);
  }, []);

  const closeProductDetail = useCallback(() => {
    setCurrentProductDetail(null);
  }, []);

  const openScenePost = useCallback(
    (scenePost: ScenePost) => {
      const idx = scenePosts.findIndex((s) => s.id === scenePost.id);
      setCurrentSceneIndex(Math.max(0, idx));
      setCurrentScenePost(scenePost);
    },
    [scenePosts]
  );

  const closeScenePost = useCallback(() => {
    setCurrentScenePost(null);
  }, []);

  const nextScenePost = useCallback(() => {
    const nextIdx = (currentSceneIndex + 1) % scenePosts.length;
    setCurrentSceneIndex(nextIdx);
    setCurrentScenePost(scenePosts[nextIdx]);
  }, [currentSceneIndex, scenePosts]);

  const prevScenePost = useCallback(() => {
    const prevIdx =
      (currentSceneIndex - 1 + scenePosts.length) % scenePosts.length;
    setCurrentSceneIndex(prevIdx);
    setCurrentScenePost(scenePosts[prevIdx]);
  }, [currentSceneIndex, scenePosts]);

  const openExhibition = useCallback((exhibition: Exhibition) => {
    setCurrentExhibition(exhibition);
  }, []);

  const closeExhibition = useCallback(() => {
    setCurrentExhibition(null);
  }, []);

  const openStore = useCallback((product: ProductItem) => {
    if (!product.storeSlug) {
      showToast('这家店铺暂时没有公开网页');
      return;
    }
    router.push(`/store/${encodeURIComponent(product.storeSlug)}`);
  }, [router, showToast]);

  const openStory = useCallback((s: Story) => {
    setCurrentStory(s);
  }, []);

  const closeStory = useCallback(() => {
    setCurrentStory(null);
  }, []);

  const openCreator = useCallback((c: Creator) => {
    setCurrentCreator(c);
  }, []);

  const closeCreator = useCallback(() => {
    setCurrentCreator(null);
  }, []);

  // Search
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    const results = DataService.searchProducts(query, products);
    setSearchResults(results);
  }, [products]);

  // Reviews
  const openReviews = useCallback(() => {
    setIsReviewsOpen(true);
  }, []);

  const closeReviews = useCallback(() => {
    setIsReviewsOpen(false);
  }, []);

  // Cart Comparison
  const startCartComparison = useCallback(
    (p1: ProductItem, p2: ProductItem) => {
      setCartComparisonPair([p1, p2]);
    },
    []
  );

  const closeCartComparison = useCallback(() => {
    setCartComparisonPair(null);
  }, []);

  // Bookmarks
  const toggleSaveProduct = useCallback(
    (productId: string) => {
      setSavedProductIds((prev) => {
        const exists = prev.includes(productId);
        const updated = exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        showToast(exists ? '已取消收藏' : '已加入我的收藏');
        return updated;
      });
    },
    [showToast]
  );

  // Q&A
  const askProductQna = useCallback(
    (productId: string, questionText: string) => {
      if (!questionText.trim()) return;
      const userMsg: QnaMessage = {
        id: `q_${Date.now()}`,
        text: questionText.trim(),
        isUser: true,
        timestamp: '刚刚',
      };

      setQnaHistory((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), userMsg],
      }));

      setTimeout(() => {
        const targetProd =
          products.find((p) => p.id === productId) || products[0];
        const { answer, evidence } = DataService.generateQnaAnswer(
          questionText,
          targetProd
        );
        const aiMsg: QnaMessage = {
          id: `a_${Date.now()}`,
          text: answer,
          isUser: false,
          evidenceText: evidence,
          timestamp: '商品资料',
        };
        setQnaHistory((prev) => ({
          ...prev,
          [productId]: [...(prev[productId] || []), aiMsg],
        }));
      }, 400);
    },
    [products]
  );

  const requestAiResponse = useCallback(async (promptText: string, image?: string, selectedProductIds: string[] = []) => {
    setIsAiThinking(true);
    try {
      const response = await fetch('/api/consumer/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          image,
          model: aiModel,
          selectedProductIds,
          history: aiMessages.filter((message) => message.conversationId === activeAiConversationId && message.timestamp !== '连接失败')
            .slice(-6).map((message) => ({ role: message.isUser ? 'user' : 'assistant', content: message.text })),
        }),
      });
      const result = await response.json() as { text?: string; styleTag?: string; matchedProductIds?: string[]; error?: string };
      if (!response.ok || !result.text) throw new Error(result.error || '模型没有返回可用内容。');
      const matchedIds = new Set(result.matchedProductIds || []);
      setAiMessages((prev) => [...prev, {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        text: result.text!,
        isUser: false,
        conversationId: activeAiConversationId,
        styleTag: result.styleTag,
        matchedProducts: products.filter((product) => matchedIds.has(product.id)).slice(0, 3),
        timestamp: 'AI 助手',
        model: aiModel,
      }]);
    } catch (error) {
      setAiMessages((prev) => [...prev, {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        text: error instanceof Error ? `模型暂时无法回答：${error.message}` : '模型暂时无法回答，请稍后重试。',
        isUser: false,
        conversationId: activeAiConversationId,
        timestamp: '连接失败',
        model: aiModel,
      }]);
    } finally {
      setIsAiThinking(false);
    }
  }, [activeAiConversationId, aiMessages, aiModel, products]);

  const sendAiMessage = useCallback((promptText: string, selectedProductIds: string[] = []) => {
    if (!promptText.trim() || isAiThinking) return;
    const userMsg: AiChatMessage = {
      id: `m_${Date.now()}`,
      text: promptText.trim(),
      isUser: true,
      conversationId: activeAiConversationId,
      timestamp: '刚刚',
    };

    setAiMessages((prev) => [...prev, userMsg]);
    const ingredientIntent = /(成分|配料|inci|cosing|cas\s*(号|number)?|护肤|化妆品|ingredient|skincare|cosmetic|[a-z][a-z /-]{3,}\s*(是什么|安全吗|适合|用途|作用))/i.test(promptText);
    if (ingredientIntent && selectedProductIds.length === 0) {
      setIsAiThinking(true);
      void fetch('/api/consumer/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptText }),
      }).then(async (response) => {
        if (!response.ok) throw new Error('成分资料暂时无法读取。');
        return response.json() as Promise<{ text: string; styleTag: string }>;
      }).then(({ text, styleTag }) => {
        setAiMessages((prev) => [...prev, {
          id: `m_${Date.now() + 1}`,
          text,
          isUser: false,
          conversationId: activeAiConversationId,
          styleTag,
          timestamp: '资料检索',
        }]);
      }).catch(() => {
        setAiMessages((prev) => [...prev, {
          id: `m_${Date.now() + 1}`,
          text: '成分资料暂时无法读取，请稍后重试。',
          isUser: false,
          conversationId: activeAiConversationId,
          styleTag: '成分资料检索',
          timestamp: '资料检索',
        }]);
      }).finally(() => setIsAiThinking(false));
      return;
    }

    void requestAiResponse(promptText.trim(), undefined, selectedProductIds);
  }, [activeAiConversationId, isAiThinking, requestAiResponse]);

  // AI Conversational Image Upload & Reasoning
  const sendAiImageMessage = useCallback(
    (imageSrc: string, promptText?: string, selectedProductIds: string[] = []) => {
      if (isAiThinking) return;
      const userMsg: AiChatMessage = {
        id: `m_${Date.now()}`,
        text: promptText?.trim() || '看看这张图',
        isUser: true,
        conversationId: activeAiConversationId,
        image: imageSrc,
        timestamp: '刚刚',
      };

      setAiMessages((prev) => [...prev, userMsg]);
      void requestAiResponse(promptText?.trim() || '', imageSrc, selectedProductIds);
    },
    [activeAiConversationId, isAiThinking, requestAiResponse]
  );

  // Delete Matched Item from AI Result List
  const deleteMatchedItem = useCallback((messageId: string, productId: string) => {
    setAiMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.matchedProducts) {
          return {
            ...msg,
            matchedProducts: msg.matchedProducts.filter((p) => p.id !== productId),
          };
        }
        return msg;
      })
    );
    showToast('已从搭配清单中移除该单品');
  }, [showToast]);

  // Replace Matched Item with New Product
  const replaceMatchedItem = useCallback(
    (messageId: string, oldProductId: string, newProduct: ProductItem) => {
      setAiMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.matchedProducts) {
            const updated = msg.matchedProducts.map((p) =>
              p.id === oldProductId ? newProduct : p
            );
            return {
              ...msg,
              matchedProducts: updated,
            };
          }
          return msg;
        })
      );
      showToast(`已替换为 ${newProduct.name}`);
    },
    [showToast]
  );

  const selectTab = useCallback((tab: MainTab) => {
    setSelectedFloatingProduct(null);
    setCurrentProductDetail(null);
    setCurrentScenePost(null);
    setCurrentExhibition(null);
    setIsReviewsOpen(false);
    setIsSearchOpen(false);
    setMainTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const openAiPage = useCallback(
    (initialPrompt?: string, initialImage?: string) => {
      setSelectedFloatingProduct(null);
      setCurrentProductDetail(null);
      setCurrentScenePost(null);
      setCurrentExhibition(null);
      setIsReviewsOpen(false);
      setIsSearchOpen(false);
      setPersonalSubTab('AI');
      setMainTab('PERSONAL');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      if (initialImage) {
        sendAiImageMessage(initialImage, initialPrompt);
      } else if (initialPrompt) {
        sendAiMessage(initialPrompt);
      }
    },
    [sendAiImageMessage, sendAiMessage]
  );

  return (
    <OmnilinkContext.Provider
      value={{
        mainTab,
        selectTab,
        personalSubTab,
        setPersonalSubTab,
        profileTab,
        setProfileTab,
        products,
        feedItems,
        scenePosts,
        exhibitions,
        creator,
        story,
        selectedFloatingProduct,
        openFloatingProduct,
        closeFloatingProduct,
        currentProductDetail,
        openProductDetail,
        closeProductDetail,
        currentScenePost,
        currentSceneIndex,
        openScenePost,
        closeScenePost,
        nextScenePost,
        prevScenePost,
        currentExhibition,
        openExhibition,
        closeExhibition,
        openStore,
        currentStory,
        openStory,
        closeStory,
        currentCreator,
        openCreator,
        closeCreator,
        isSearchOpen,
        setSearchOpen: setIsSearchOpen,
        searchQuery,
        searchResults,
        updateSearchQuery,
        isReviewsOpen,
        openReviews,
        closeReviews,
        cartItems,
        cartCount,
        addToCart,
        addMultipleToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartComparisonPair,
        startCartComparison,
        closeCartComparison,
        aiMessages,
        activeAiConversationId,
        archivedAiConversationIds,
        selectAiConversation,
        startAiConversation,
        archiveAiConversation,
        deleteAiConversation,
        isAiThinking,
        aiModel,
        setAiModel,
        sendAiMessage,
        sendAiImageMessage,
        deleteMatchedItem,
        replaceMatchedItem,
        openAiPage,
        qnaHistory,
        askProductQna,
        toastMessage,
        showToast,
        savedProductIds,
        toggleSaveProduct,
      }}
    >
      {children}
    </OmnilinkContext.Provider>
  );
};

export const useOmnilink = (): OmnilinkContextType => {
  const context = useContext(OmnilinkContext);
  if (!context) {
    throw new Error('useOmnilink must be used within an OmnilinkProvider');
  }
  return context;
};
