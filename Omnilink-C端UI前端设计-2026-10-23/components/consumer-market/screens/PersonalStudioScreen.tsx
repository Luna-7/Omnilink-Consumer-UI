import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Send,
  User,
  Image as ImageIcon,
  ArrowRight,
  ArrowDown,
  Plus,
  Camera,
  ShoppingBag,
  ArrowLeft,
  Layers,
  List,
  History,
  X,
  Puzzle,
  Mic,
  MicOff,
  ChevronDown,
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { useOmnilink } from '../context/OmnilinkContext';
import { ProductItem, type ConsumerAiModel } from '../types';
import { Button } from '@/components/ui/button';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CapabilityLibrary } from '../components/CapabilityLibrary';
import Carousel from './Carousel';
import AILoadingState, { type AgentStep } from '@/components/kokonutui/ai-loading';
import SwipeRow from '@/components/react-bits/SwipeRow';
import { Message, MessageContent, MessageScrollerItem } from '@/components/ai-elements/chat';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group';

const CONSUMER_AI_LOADING_STEPS: AgentStep[] = [{
  id: 'request',
  label: 'AI 正在分析并匹配商品',
  status: 'running',
  detail: ['AI 请求处理中'],
}];

const EVA_PROMPT_SUGGESTIONS = ['穿搭推荐', '空间搭配', '找同款', '单品推荐'];
const CONSUMER_AI_MODELS: { id: ConsumerAiModel; label: string }[] = [
  { id: 'gemini', label: 'Gemini' },
  { id: 'qwen-plus', label: 'Qwen Plus' },
  { id: 'deepseek-flash', label: 'DeepSeek Flash' },
  { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
];

const UserMessageBubble: React.FC<{ text: string }> = ({ text }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [isSingleLine, setIsSingleLine] = useState(false);

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    const measureLines = () => {
      const range = document.createRange();
      range.selectNodeContents(bubble);
      const lineTops = Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => Math.round(rect.top));
      const nextIsSingleLine = lineTops.length > 0 && Math.max(...lineTops) - Math.min(...lineTops) < 2;
      setIsSingleLine((current) => current === nextIsSingleLine ? current : nextIsSingleLine);
    };

    measureLines();
    const observer = new ResizeObserver(measureLines);
    observer.observe(bubble);
    return () => observer.disconnect();
  }, [text]);

  return <div ref={bubbleRef} data-slot="bubble" data-variant="muted" className={`max-w-full bg-[var(--market-surface-muted)] px-4 py-3 text-sm leading-6 ${isSingleLine ? 'rounded-full' : 'rounded-[14px]'}`}>{text}</div>;
};

type VoiceRecognitionResult = { 0?: { transcript?: string }; isFinal?: boolean };
type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<VoiceRecognitionResult> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};
type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

export const PersonalStudioScreen: React.FC = () => {
  const {
    personalSubTab,
    setPersonalSubTab,
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
    cartItems,
    showToast,
    selectTab,
  } = useOmnilink();

  const [inputVal, setInputVal] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState<ProductItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyView, setHistoryView] = useState<'recent' | 'archived'>('recent');
  const [recommendationView, setRecommendationView] = useState<'list' | 'carousel'>('list');
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<'add' | 'cart'>('add');
  const [selectedCartProductIds, setSelectedCartProductIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const messageScrollerRef = useRef<HTMLDivElement>(null);
  const suppressScrollTrackingRef = useRef(false);
  const previousConversationIdRef = useRef(activeAiConversationId);
  const previousLatestMessageIdRef = useRef<string | null>(null);
  const scrollToLastUserAnchorRef = useRef<((behavior?: ScrollBehavior) => void) | null>(null);
  const pendingUserAnchorRef = useRef(false);
  const shouldFollowLatestRef = useRef(true);
  const wasRecommendationOpenRef = useRef(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const selectedCartIds = selectedCartProductIds.filter((id) => cartItems.some((item) => item.product.id === id));
  const conversationMessages = useMemo(() => aiMessages.filter((msg) => msg.conversationId === activeAiConversationId), [aiMessages, activeAiConversationId]);
  const historyConversations = aiMessages.filter((message, index) => message.isUser && !aiMessages.slice(0, index).some((earlier) => earlier.conversationId === message.conversationId));
  const visibleHistory = historyConversations.filter((message) => archivedAiConversationIds.includes(message.conversationId!) === (historyView === 'archived'));

  const latestConversationMessage = conversationMessages[conversationMessages.length - 1];

  const scrollToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const scroller = messageScrollerRef.current;
    if (!scroller) return;
    shouldFollowLatestRef.current = true;
    setShowJumpToLatest(false);
    suppressScrollTrackingRef.current = true;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
    requestAnimationFrame(() => requestAnimationFrame(() => { suppressScrollTrackingRef.current = false; }));
  }, []);

  const scrollToMessageAnchor = useCallback((messageId: string, behavior: ScrollBehavior = 'smooth') => {
    const scroller = messageScrollerRef.current;
    const anchor = document.getElementById(`eva-message-${messageId}`);
    if (!scroller || !anchor) return;
    suppressScrollTrackingRef.current = true;
    const top = scroller.scrollTop + anchor.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 48;
    scroller.scrollTo({ top: Math.max(0, top), behavior });
    requestAnimationFrame(() => requestAnimationFrame(() => { suppressScrollTrackingRef.current = false; }));
  }, []);

  const scrollToLastUserAnchor = useCallback((behavior: ScrollBehavior = 'auto') => {
    const lastUserMessage = [...conversationMessages].reverse().find((message) => message.isUser);
    if (lastUserMessage) scrollToMessageAnchor(lastUserMessage.id, behavior);
    else scrollToLatest(behavior);
  }, [conversationMessages, scrollToMessageAnchor, scrollToLatest]);

  useEffect(() => {
    scrollToLastUserAnchorRef.current = scrollToLastUserAnchor;
  }, [scrollToLastUserAnchor]);

  useEffect(() => {
    const latestMessage = latestConversationMessage;
    const isConversationChange = previousConversationIdRef.current !== activeAiConversationId;

    if (isConversationChange) {
      previousConversationIdRef.current = activeAiConversationId;
      previousLatestMessageIdRef.current = latestMessage?.id ?? null;
      pendingUserAnchorRef.current = false;
      shouldFollowLatestRef.current = false;
      requestAnimationFrame(() => scrollToLastUserAnchorRef.current?.('auto'));
      return;
    }

    if (selectedRecommendation) {
      wasRecommendationOpenRef.current = true;
      return;
    }

    if (wasRecommendationOpenRef.current) {
      wasRecommendationOpenRef.current = false;
      requestAnimationFrame(() => scrollToLatest('auto'));
      return;
    }

    if (previousLatestMessageIdRef.current === null && latestMessage) {
      previousLatestMessageIdRef.current = latestMessage.id;
      shouldFollowLatestRef.current = false;
      requestAnimationFrame(() => scrollToLastUserAnchorRef.current?.('auto'));
      return;
    }

    if (!latestMessage || latestMessage.id === previousLatestMessageIdRef.current) {
      if (isAiThinking && shouldFollowLatestRef.current) {
        requestAnimationFrame(() => scrollToLatest('auto'));
      }
      return;
    }

    previousLatestMessageIdRef.current = latestMessage.id;

    if (pendingUserAnchorRef.current && latestMessage.isUser) {
      pendingUserAnchorRef.current = false;
      shouldFollowLatestRef.current = true;
      setShowJumpToLatest(false);
      requestAnimationFrame(() => scrollToMessageAnchor(latestMessage.id));
      return;
    }

    if (shouldFollowLatestRef.current) requestAnimationFrame(() => scrollToLatest('smooth'));
    else setShowJumpToLatest(true);
  }, [activeAiConversationId, isAiThinking, latestConversationMessage, scrollToLatest, scrollToMessageAnchor, selectedRecommendation]);

  const handleMessageScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (suppressScrollTrackingRef.current) return;
    const scroller = event.currentTarget;
    const atLatest = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 56;
    shouldFollowLatestRef.current = atLatest;
    setShowJumpToLatest(!atLatest);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputVal.trim() && selectedCartIds.length === 0) || isAiThinking) return;
    pendingUserAnchorRef.current = true;
    sendAiMessage(inputVal.trim() || '请分析我选中的购物车商品，并说明搭配建议。', selectedCartIds);
    setInputVal('');
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      voiceRecognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const speechWindow = window as VoiceWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      showToast('当前浏览器不支持语音输入。');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript || '')
        .join('');
      if (transcript) setInputVal((current) => `${current}${current && !current.endsWith(' ') ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = (event) => {
      setIsRecording(false);
      voiceRecognitionRef.current = null;
      if (event.error !== 'aborted') showToast('语音输入未完成，请检查麦克风权限。');
    };
    recognition.onend = () => {
      setIsRecording(false);
      voiceRecognitionRef.current = null;
    };
    try {
      recognition.start();
      voiceRecognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      voiceRecognitionRef.current = null;
      setIsRecording(false);
      showToast('无法启动语音输入，请检查麦克风权限。');
    }
  };

  useEffect(() => () => voiceRecognitionRef.current?.stop(), []);

  const handleSuggestionSend = (prompt: string) => {
    if (isAiThinking) return;
    pendingUserAnchorRef.current = true;
    setSelectedRecommendation(null);
    sendAiMessage(prompt);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('图片不能超过 3 MB。');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isAiThinking) return;
        pendingUserAnchorRef.current = true;
        sendAiImageMessage(result, inputVal.trim() || undefined, selectedCartIds);
        setInputVal('');
        setSelectedRecommendation(null);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const openFeature = (feature: 'image' | 'space' | 'cart') => {
    setPersonalSubTab('AI');
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsUploadMenuOpen(true);
    if (feature === 'cart') {
      setMenuView('cart');
      setInputVal('分析已选商品');
    } else {
      setMenuView('add');
      setInputVal(feature === 'image' ? '看看我的穿搭' : '看看我的空间');
    }
  };

  return (
    <div className={`flex flex-col pt-2 text-[var(--market-ink)] select-none ${personalSubTab === 'AI' ? 'h-dvh min-h-0 overflow-hidden' : 'min-h-dvh justify-between'}`}>
      {/* Top Header Switcher */}
      <div className="sticky top-0 z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-white px-2 py-2 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={() => selectTab('WORLD')}
          aria-label="返回发现"
          className="flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[clamp(10px,3vw,12px)] font-medium text-[var(--market-text-muted)] transition-colors hover:bg-[var(--market-surface-muted)] hover:text-[var(--market-ink)] sm:gap-2 sm:px-3"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>返回</span>
        </button>
        <div className="inline-flex h-10 min-w-0 shrink-0 items-center justify-self-center whitespace-nowrap rounded-full border border-[var(--market-border)] bg-[var(--market-surface-muted)] p-1">
          <button
            type="button"
            onClick={() => {
              setPersonalSubTab('AI');
              setSelectedRecommendation(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            aria-label="EVA 助手"
            title="EVA"
            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-2 text-[clamp(10px,3vw,12px)] font-medium transition-all sm:px-3 ${
              personalSubTab === 'AI'
                ? 'bg-[var(--market-accent)] text-[var(--market-surface)] shadow-xs'
                : 'text-[var(--market-text-muted)] hover:text-[var(--market-ink)]'
            }`}
          >
            <Sparkles size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setPersonalSubTab('ME');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            aria-label="我的功能"
            title="我的功能"
            className={`flex h-8 shrink-0 items-center justify-center rounded-full px-2 text-[clamp(10px,3vw,12px)] font-medium transition-all sm:px-3 ${
              personalSubTab === 'ME'
                ? 'bg-[var(--market-accent)] text-[var(--market-surface)] shadow-xs'
                : 'text-[var(--market-text-muted)] hover:text-[var(--market-ink)]'
            }`}
          >
            <Puzzle size={14} aria-hidden="true" />
          </button>
        </div>
        <button type="button" onClick={() => setHistoryOpen(true)} aria-label="打开历史记录" title="历史记录" className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--market-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--market-support)]"><History size={17} aria-hidden="true" /></button>
      </div>

      {personalSubTab === 'AI' ? (
        <div className="flex min-h-0 w-full flex-1 flex-col">
          {selectedRecommendation ? (
            <div className="mx-auto w-full max-w-md px-4">
              <div className="mb-4 flex justify-end">
                <button type="button" onClick={() => setSelectedRecommendation(null)} aria-label="关闭商品详情，返回对话" className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--market-ink)] transition-colors hover:bg-[var(--market-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)]">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <img src={selectedRecommendation.mainImage} alt={selectedRecommendation.name} className="aspect-square w-full rounded-xl bg-[var(--market-surface-muted)] object-cover" />
              <div className="mt-4 flex items-center justify-between gap-4">
                <h2 className="min-w-0 text-base font-semibold">{selectedRecommendation.name}</h2>
                <span className="shrink-0 text-base font-semibold">{selectedRecommendation.formattedPrice}</span>
              </div>
              <div className="mt-6 flex items-center gap-2">
                {Object.entries(selectedRecommendation.outboundLinks ?? {}).filter(([, url]) => Boolean(url)).map(([platform, url], index) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className={`flex h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--radius-control)] px-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)] ${index === 0 ? 'bg-[var(--market-accent)] text-white' : 'border border-[var(--market-border)] bg-white text-[var(--market-ink)]'}`}>
                    {platform === 'xiaohongshu' ? '小红书查看' : '抖音查看'} ↗
                  </a>
                ))}
                {!Object.values(selectedRecommendation.outboundLinks ?? {}).some(Boolean) && <p className="text-sm text-[var(--market-text-muted)]">暂无渠道链接</p>}
              </div>
            </div>
          ) : (
            <>
              <div
                ref={messageScrollerRef}
                onScroll={handleMessageScroll}
                role="log"
                aria-label="EVA 对话"
                aria-live="polite"
                data-slot="message-scroller"
                className="relative min-h-0 w-full flex-1 scroll-pt-4 overflow-y-auto overscroll-contain"
              >
                <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-4 pt-4 sm:px-6">
                {!conversationMessages.length ? <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
                  <ImageIcon size={42} strokeWidth={1.2} className="text-[var(--market-text-muted)]" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-semibold">发张图，或者直接问</h2>
                  <p className="mt-2 text-sm text-[var(--market-text-muted)]">穿搭、空间、商品，随时聊。</p>
                </div> : <div data-slot="message-scroller-content" className="space-y-6">
                {conversationMessages.map((msg) => (
                  <MessageScrollerItem
                    key={msg.id}
                    id={`eva-message-${msg.id}`}
                    messageId={msg.id}
                    data-message-id={msg.id}
                    data-role={msg.isUser ? 'user' : 'assistant'}
                    scrollAnchor={msg.isUser}
                  >
                    <Message align={msg.isUser ? 'end' : 'start'} data-role={msg.isUser ? 'user' : 'assistant'} className={msg.isUser ? 'max-w-[88%]' : 'max-w-[92%]'}>
                    <MessageContent className={msg.isUser ? 'items-end gap-2' : 'w-full'}>{msg.isUser ? <div className="flex min-w-0 flex-col items-end gap-2">
                        {msg.image && <img src={msg.image} alt="你发送的图片" className="max-h-[360px] w-auto max-w-full rounded-xl object-cover" />}
                        {msg.text && msg.text !== '看看这张图' && <UserMessageBubble text={msg.text} />}
                    </div> : <div className="w-full">
                      <p className="text-base leading-6">{msg.matchedProducts?.length ? `找到 ${msg.matchedProducts.length} 件商品。` : msg.text}</p>
                      {msg.matchedProducts?.length ? <div className="mt-4">
                        <div className="mb-2 flex h-8 items-center justify-end">
                          <button type="button" onClick={() => setRecommendationView((view) => view === 'list' ? 'carousel' : 'list')} className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white text-[var(--market-text-muted)] transition-colors hover:bg-[var(--market-surface-muted)] hover:text-[var(--market-ink)] focus-visible:outline-2 focus-visible:outline-[var(--market-support)]" aria-label={recommendationView === 'list' ? '切换轮播视图' : '切换列表视图'} title={recommendationView === 'list' ? '轮播视图' : '列表视图'} aria-pressed={recommendationView === 'carousel'}>
                            {recommendationView === 'list' ? <Layers size={17} aria-hidden="true" /> : <List size={17} aria-hidden="true" />}
                          </button>
                        </div>
                        {recommendationView === 'list' ? <div className="grid gap-2.5">
                          {msg.matchedProducts.slice(0, 3).map((product, index) => <button key={product.id} type="button" onClick={() => setSelectedRecommendation(product)} className="ai-recommendation-card ui-card flex min-h-24 w-full items-center gap-3 !rounded-xl !border-[var(--market-text-muted)]/30 p-2 text-left !shadow-sm transition-colors hover:bg-[var(--market-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)]" style={{ animationDelay: `${index * 110}ms` }}>
                            <img src={product.mainImage} alt="" className="h-20 w-20 shrink-0 rounded-[var(--radius-control)] bg-[var(--market-surface-muted)] object-cover sm:h-24 sm:w-24" />
                            <span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-semibold">{product.name}</span><span className="mt-2 block text-sm font-semibold">{product.formattedPrice}</span></span>
                            <ArrowRight size={18} className="shrink-0 text-[var(--market-ink)]" aria-hidden="true" />
                          </button>)}
                        </div> : <Carousel
                          items={msg.matchedProducts.slice(0, 3).map((product) => ({ title: product.name, description: product.formattedPrice, image: product.mainImage }))}
                          baseWidth={390} aspectRatio={0.75} effect="slide" indicator="bars" frame arrows={false} loop={false} autoplay autoplayDelay={3000} pauseOnHover theme="light" peek={0} gap={12} radius={4} draggable round={false}
                          onItemClick={(index) => setSelectedRecommendation(msg.matchedProducts![index])}
                        />}
                      </div> : null}
                    </div>}</MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
                {isAiThinking && <MessageScrollerItem messageId="eva-pending"><Message align="start" data-role="assistant"><MessageContent aria-label="EVA 正在回复" className="max-w-[92%] text-sm text-[var(--market-text-muted)]"><AILoadingState steps={CONSUMER_AI_LOADING_STEPS} className="justify-start" /></MessageContent></Message></MessageScrollerItem>}
                </div>}
                </div>
                {showJumpToLatest && <button type="button" onClick={() => scrollToLatest()} aria-label="跳到最新消息" className="absolute bottom-48 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--market-ink)] text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)]"><ArrowDown size={18} aria-hidden="true" /></button>}
              </div>
            </>
          )}
          <div className="relative z-20 w-full shrink-0 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-0 right-2 z-10 h-24"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--market-surface) 16%, transparent) 42%, color-mix(in srgb, var(--market-surface) 52%, transparent) 100%)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png,image/jpeg,image/webp" className="hidden" />
            <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/png,image/jpeg,image/webp" capture="environment" className="hidden" />
            <form onSubmit={(event) => { setSelectedRecommendation(null); handleSend(event); }} className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2">
              <div className="flex gap-2 overflow-x-auto overscroll-x-contain scrollbar-none">
                {EVA_PROMPT_SUGGESTIONS.map((suggestion) => <Button key={suggestion} type="button" variant="outline" size="sm" disabled={isAiThinking} onClick={() => handleSuggestionSend(suggestion)} className="h-8 shrink-0 rounded-full border-[var(--market-border)] bg-white px-3 text-[var(--market-ink)] hover:bg-[var(--market-surface-muted)] hover:text-[var(--market-ink)]">{suggestion}</Button>)}
              </div>
              <LiquidGlass
                radius={32}
                bevelDepth={8}
                scale={12}
                aberration={1}
                frost={12}
                tint={0.34}
                className="flex min-h-28 flex-col gap-2 border border-[var(--market-glass-border)] p-2.5 text-[var(--market-ink)] shadow-sm focus-within:border-[var(--market-support)]"
                style={{ backgroundColor: 'color-mix(in srgb, var(--market-surface) 84%, transparent)' }}
              >
              <InputGroup data-prompt-input="true" className="min-h-24 gap-2">
              <InputGroupTextarea id="consumer-ai-input" rows={2} value={inputVal} onChange={(event) => setInputVal(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); setSelectedRecommendation(null); handleSend(); } }} placeholder="发消息或图片…" aria-label="发消息或图片" className="max-h-28 min-h-12 w-full overflow-y-auto px-2 py-1.5 text-sm leading-5 text-[var(--market-ink)] placeholder:text-[var(--market-text-muted)]" />
              <InputGroupAddon align="block-end" className="min-h-9">
              <div className="relative shrink-0">
                <InputGroupButton type="button" onClick={() => setIsUploadMenuOpen((open) => !open)} aria-label="添加图片" aria-expanded={isUploadMenuOpen} className="text-[var(--market-ink)] hover:bg-[var(--market-ink)]/5 focus-visible:outline-[var(--market-support)]"><Plus size={19} aria-hidden="true" /></InputGroupButton>
                {isUploadMenuOpen && <div className="ui-card--floating absolute bottom-[calc(100%+8px)] left-0 w-48 border border-[var(--market-border)] bg-white p-1 shadow-lg">
                  {menuView === 'cart' ? <div>
                    <button type="button" onClick={() => setMenuView('add')} className="flex h-11 w-full items-center gap-2 px-2 text-sm"><ArrowLeft size={16} />购物车</button>
                    <div className="max-h-52 overflow-y-auto">
                      {cartItems.length ? cartItems.map((item) => <label key={item.product.id} className="flex min-h-11 items-center gap-2 px-2 text-xs">
                        <input type="checkbox" checked={selectedCartProductIds.includes(item.product.id)} onChange={() => setSelectedCartProductIds((current) => current.includes(item.product.id) ? current.filter((id) => id !== item.product.id) : [...current, item.product.id])} />
                        <span className="truncate">{item.product.name}</span>
                      </label>) : <p className="px-2 py-3 text-xs text-[var(--market-text-muted)]">购物车暂无商品</p>}
                    </div>
                    <button type="button" onClick={() => setIsUploadMenuOpen(false)} className="h-11 w-full text-sm text-[var(--market-support)]">完成</button>
                  </div> : <>
                  <button type="button" onClick={() => { setIsUploadMenuOpen(false); fileInputRef.current?.click(); }} className="flex h-11 w-full items-center gap-2 rounded-[var(--radius-control)] px-2 text-sm hover:bg-[var(--market-surface-muted)]"><ImageIcon size={17} />相册</button>
                  <button type="button" onClick={() => { setIsUploadMenuOpen(false); cameraInputRef.current?.click(); }} className="flex h-11 w-full items-center gap-2 rounded-[var(--radius-control)] px-2 text-sm hover:bg-[var(--market-surface-muted)]"><Camera size={17} />拍照</button>
                  <button type="button" onClick={() => setMenuView('cart')} className="flex h-11 w-full items-center gap-2 rounded-[var(--radius-control)] px-2 text-sm hover:bg-[var(--market-surface-muted)]"><ShoppingBag size={17} />购物车</button>
                  </>}
                </div>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label={`选择模型，当前为 ${CONSUMER_AI_MODELS.find((model) => model.id === aiModel)?.label ?? 'Gemini'}`} className="flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium text-[var(--market-ink)] transition-colors hover:bg-[var(--market-ink)]/5 focus-visible:outline-2 focus-visible:outline-[var(--market-support)]">
                    {CONSUMER_AI_MODELS.find((model) => model.id === aiModel)?.label ?? 'Gemini'}
                    <ChevronDown size={13} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-48 !text-[var(--palette-ink)] [&_*]:!text-[var(--palette-ink)]" style={{ backgroundColor: 'color-mix(in srgb, var(--palette-porcelain) 96%, transparent)', borderColor: 'color-mix(in srgb, var(--palette-ink) 14%, transparent)' }}>
                  <DropdownMenuRadioGroup value={aiModel} onValueChange={(value) => setAiModel(value as ConsumerAiModel)}>
                    {CONSUMER_AI_MODELS.map((model) => <DropdownMenuRadioItem key={model.id} value={model.id} className="normal-case tracking-normal">{model.label}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" onClick={toggleVoiceInput} disabled={isAiThinking} aria-label={isRecording ? '停止语音输入' : '语音输入'} aria-pressed={isRecording} title={isRecording ? '停止语音输入' : '语音输入'} className={`ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--market-support)] ${isRecording ? 'bg-[var(--market-surface-muted)] text-[var(--market-ink)]' : 'text-[var(--market-ink)] hover:bg-[var(--market-ink)]/5'}`}>
                {isRecording ? <MicOff size={17} aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
              </button>
              <InputGroupButton type="submit" variant="default" disabled={(!inputVal.trim() && selectedCartIds.length === 0) || isAiThinking} aria-label="发送" className="shrink-0 bg-white text-[var(--market-ink)] hover:bg-white/80 focus-visible:outline-[var(--market-support)]"><Send size={16} aria-hidden="true" /></InputGroupButton>
              </InputGroupAddon>
              </InputGroup>
              </LiquidGlass>
            </form>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-5 sm:px-6">
          <section>
            <h4 className="mb-3 text-lg font-semibold tracking-tight text-[var(--market-ink)]">我的功能</h4>
            <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 sm:gap-x-5">
              {[
                { key: 'image' as const, icon: User, name: '个人形象管理', description: '上传穿搭照片，分析风格并寻找合适单品', tone: 'bg-[var(--market-surface-muted)] text-[var(--market-support)]' },
                { key: 'space' as const, icon: ImageIcon, name: '空间搭配建议', description: '上传空间照片，识别风格并推荐搭配', tone: 'bg-[var(--market-surface-muted)] text-[var(--market-support)]' },
                { key: 'cart' as const, icon: ShoppingBag, name: '购物车商品分析', description: '选择购物车商品，让 AI 分析搭配关系', tone: 'bg-[var(--market-surface-muted)] text-[var(--market-support)]' },
              ].map(({ key, icon: Icon, name, description, tone }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => openFeature(key)}
                  className="group flex min-h-[76px] w-full items-center gap-3 !rounded-[var(--radius-card)] px-3 py-3 text-left transition-colors hover:bg-[var(--market-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-support)] sm:min-h-[88px] sm:px-4"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${tone}`}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-[var(--market-ink)]">{name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--market-text-muted)]">{description}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-[var(--market-text-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <CapabilityLibrary />
        </div>
      )}
      {historyOpen && <div className="fixed inset-0 z-50" role="presentation">
        <div onClick={() => setHistoryOpen(false)} className="absolute inset-0 bg-black/25" aria-hidden="true" />
        <aside role="dialog" aria-modal="true" aria-label="历史记录" className="ui-card--floating absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col border-l border-[var(--market-border)] bg-white shadow-xl animate-in slide-in-from-right duration-200">
          <div className="flex h-16 items-center justify-between border-b border-[var(--market-border)] px-5"><h2 className="text-base font-semibold">历史记录</h2><button type="button" onClick={() => setHistoryOpen(false)} aria-label="关闭" className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--market-support)]"><X size={18} /></button></div>
          <div className="flex h-11 items-center gap-2 px-4"><button type="button" onClick={() => setHistoryView('recent')} aria-pressed={historyView === 'recent'} className={`h-9 px-3 text-sm ${historyView === 'recent' ? 'font-semibold text-[var(--market-support)]' : 'text-[var(--market-text-muted)]'}`}>最近</button><button type="button" onClick={() => setHistoryView('archived')} aria-pressed={historyView === 'archived'} className={`h-9 px-3 text-sm ${historyView === 'archived' ? 'font-semibold text-[var(--market-support)]' : 'text-[var(--market-text-muted)]'}`}>已归档</button></div>
          <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">{visibleHistory.length ? visibleHistory.map((message) => {
            const openMessage = () => { selectAiConversation(message.conversationId!); setPersonalSubTab('AI'); setSelectedRecommendation(null); setHistoryOpen(false); };
            return <SwipeRow key={message.conversationId} label={message.text || '图片消息'} actions={[{ id: 'delete', label: '删除', icon: <HugeiconsIcon icon={Delete02Icon} size={20} /> }, { id: 'archive', label: historyView === 'archived' ? '恢复' : '归档', icon: <HugeiconsIcon icon={Archive02Icon} size={20} />, dismiss: true }]} onCommit={(action) => action.id === 'delete' ? deleteAiConversation(message.conversationId!) : archiveAiConversation(message.conversationId!)} actionColor="var(--market-accent)" drawerColor="var(--market-support)" rowColor="var(--market-surface-muted)" textColor="var(--market-ink)" height={64} radius={12} actionWidth={80} direction="left" snapBounce={0.14} resistance={0.55} collapseMs={200} commitAt={0.6} fullSwipe><button type="button" onClick={openMessage} className="h-full w-full min-w-0 truncate text-left text-sm focus-visible:outline-2 focus-visible:outline-[var(--market-support)]">{message.text || '图片消息'}</button></SwipeRow>;
          }) : <p className="px-3 py-5 text-sm text-[var(--market-text-muted)]">{historyView === 'archived' ? '没有已归档对话' : '还没有历史对话'}</p>}</div>
          <button type="button" onClick={() => { startAiConversation(); setHistoryOpen(false); }} className="mx-4 mb-4 h-11 rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-sm font-semibold text-white">新对话</button>
        </aside>
      </div>}
    </div>
  );
};
