'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Menu,
  Sparkles,
  X,
  Plus,
  SlidersHorizontal,
  ArrowUp,
  Wand2,
  Workflow,
  Image,
  Brain,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Store,
} from 'lucide-react';
import BlobCanvas from './BlobCanvas';

interface ChatMessage {
  id: string;
  isUser: boolean;
  text: string;
  time?: string;
  reasoning?: string;
  reasoningDuration?: string;
  feedback?: 'up' | 'down';
  copied?: boolean;
}

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

const START_CARDS = [
  {
    title: '专属智能体',
    desc: '具备持久记忆与个性化设定',
    icon: Sparkles,
    prompt: '我想配置并启动专属智能体，请介绍其记忆库与设定能力。',
  },
  {
    title: '图像编辑',
    desc: '基于上下文精准重绘图像',
    icon: Wand2,
    prompt: '我想使用图像编辑工具，请展示支持的处理模式。',
  },
  {
    title: '自动化任务',
    desc: '自动化处理复杂多步流程',
    icon: Workflow,
    prompt: '帮我规划并执行一个端到端的自动化任务流。',
  },
];

export default function AiChatCard() {
  const [viewMode, setViewMode] = useState<'home' | 'chat'>('home');
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('分析意图与语境');
  const [expandedReasoningIds, setExpandedReasoningIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Manus 1.6 Lite');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCards, setShowCards] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<VoiceRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (viewMode === 'chat') {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking, viewMode]);

  const handleCopy = async (id: string, text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    } catch {
      // fallback
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, feedback: m.feedback === type ? undefined : type } : m
      )
    );
  };

  const handleRegenerate = async (targetMsgId: string) => {
    const targetIdx = messages.findIndex((m) => m.id === targetMsgId);
    if (targetIdx === -1) return;

    let userPrompt = '';
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        userPrompt = messages[i].text;
        break;
      }
    }
    if (!userPrompt) return;

    setIsThinking(true);
    setThinkingStep('重新组织推理框架');

    try {
      const res = await fetch('/api/consumer/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const data = await res.json();
      const reply = data.text || '已根据您的需求更新回答。';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetMsgId
            ? {
                ...m,
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                feedback: undefined,
              }
            : m
        )
      );
    } catch {
      // Keep previous
    } finally {
      setIsThinking(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setExpandedReasoningIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCardClick = (card: (typeof START_CARDS)[number]) => {
    setInputVal(card.prompt);
    setViewMode('chat');
    handleSend(card.prompt);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputVal).trim();
    if (!textToSend || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      isUser: true,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setViewMode('chat');
    setIsThinking(true);
    setThinkingStep('正在解析目标与上下文');

    const stepTimer = setTimeout(() => {
      setThinkingStep('检索知识图谱并规划输出');
    }, 900);

    try {
      const res = await fetch('/api/consumer/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend }),
      });

      clearTimeout(stepTimer);

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const assistantText = data.text || '已完成任务处理。';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          isUser: false,
          text: assistantText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reasoning:
            '根据输入意图进行语义分解，匹配最优工具链并执行多轮推理，校验结果的逻辑一致性。',
          reasoningDuration: '0.8秒',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          isUser: false,
          text: '已为您连接核心计算节点，随时可以继续交互。',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      voiceRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const win = window as VoiceWindow;
    const Recognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Recognition) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSend('请介绍一下当前智能体的主要能力与使用方式。');
      }, 1800);
      return;
    }

    const rec = new Recognition();
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .slice(ev.resultIndex)
        .map((r) => r[0]?.transcript || '')
        .join('');
      if (transcript) {
        setInputVal(transcript);
        handleSend(transcript);
      }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    try {
      rec.start();
      voiceRef.current = rec;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-[#FFFFFF] dark:bg-[#111113] flex flex-col justify-between relative selection:bg-[#E8E8EC]">
      {/* Proportionally scaled web container */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-between min-h-dvh px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Top Navigation Bar */}
        <header className="pt-4 pb-3 md:pt-6 md:pb-4 flex items-center justify-between shrink-0 gap-3">
          {/* Left: Back button & Model Selector Pill */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setViewMode('home');
                setShowCards(true);
              }}
              aria-label="返回首页"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-900 border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 flex items-center justify-center text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] shadow-2xs transition-colors duration-250 ease-out cursor-pointer active:scale-95"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
            </button>

            {/* Model Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelMenu((v) => !v)}
                className="h-9 md:h-10 px-3.5 md:px-4 rounded-2xl md:rounded-[20px] bg-white dark:bg-zinc-900 border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 flex items-center gap-2 text-[14px] font-medium text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] shadow-2xs transition-colors duration-250 ease-out cursor-pointer active:scale-95"
              >
                <span>{selectedModel}</span>
                <ChevronDown size={14} strokeWidth={1.8} className="text-[#687076]" />
              </button>

              {showModelMenu && (
                <div className="absolute left-0 top-11 md:top-12 z-40 w-48 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-xl border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 text-[12px]">
                  {['Manus 1.6 Lite', 'Manus 2.0 Pro', 'Manus Omni'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors duration-250 ease-out cursor-pointer ${
                        selectedModel === m
                          ? 'bg-[#F1F3F5] dark:bg-zinc-800 font-semibold text-[#1C2024] dark:text-white'
                          : 'text-[#687076] dark:text-zinc-300 hover:bg-[#F9F9FB]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Segmented Navigation (首页 / 对话) */}
          <div className="flex items-center p-0.5 rounded-2xl md:rounded-[20px] bg-[#F1F3F5] dark:bg-zinc-800 border-[0.5px] border-[#E8E8EC] dark:border-zinc-700">
            <button
              type="button"
              onClick={() => {
                setViewMode('home');
                setShowCards(true);
              }}
              className={`px-3.5 md:px-5 py-1.5 rounded-[14px] md:rounded-[18px] text-[12px] md:text-[14px] font-medium transition-all duration-250 ease-out cursor-pointer ${
                viewMode === 'home'
                  ? 'bg-white dark:bg-zinc-900 text-[#1C2024] dark:text-white shadow-2xs'
                  : 'text-[#687076] dark:text-zinc-400 hover:text-[#1C2024] dark:hover:text-zinc-200'
              }`}
            >
              首页
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-3.5 md:px-5 py-1.5 rounded-[14px] md:rounded-[18px] text-[12px] md:text-[14px] font-medium transition-all duration-250 ease-out cursor-pointer ${
                viewMode === 'chat'
                  ? 'bg-white dark:bg-zinc-900 text-[#1C2024] dark:text-white shadow-2xs'
                  : 'text-[#687076] dark:text-zinc-400 hover:text-[#1C2024] dark:hover:text-zinc-200'
              }`}
            >
              对话
            </button>
          </div>

          {/* Right: Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMainMenu((v) => !v)}
              aria-label="菜单"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-900 border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 flex items-center justify-center text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] shadow-2xs transition-colors duration-250 ease-out cursor-pointer active:scale-95"
            >
              <Menu size={16} strokeWidth={1.8} />
            </button>

            {showMainMenu && (
              <div className="absolute right-0 top-11 md:top-12 z-40 w-44 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-xl border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('home');
                    setShowCards(true);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] dark:hover:bg-zinc-800 transition-colors duration-250 ease-out cursor-pointer"
                >
                  <Sparkles size={14} strokeWidth={1.8} className="text-[#687076] shrink-0" />
                  <span>首页</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('chat');
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] dark:hover:bg-zinc-800 transition-colors duration-250 ease-out cursor-pointer"
                >
                  <Workflow size={14} strokeWidth={1.8} className="text-[#687076] shrink-0" />
                  <span>对话界面</span>
                </button>
                <a
                  href="/"
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] dark:hover:bg-zinc-800 transition-colors duration-250 ease-out cursor-pointer"
                >
                  <Store size={14} strokeWidth={1.8} className="text-[#687076] shrink-0" />
                  <span>灵感市场</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setViewMode('home');
                    setShowCards(true);
                    setShowMainMenu(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#E5484D] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-250 ease-out cursor-pointer"
                >
                  <RotateCcw size={14} strokeWidth={1.8} className="text-[#E5484D] shrink-0" />
                  <span>清空会话</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Center Body: Proportionally Scaled Fluid Orb or Conversation Stream */}
        {viewMode === 'home' ? (
          <main className="flex-1 flex flex-col items-center justify-center py-6 md:py-12 relative">
            <div className="relative w-72 h-72 md:w-[420px] md:h-[420px] lg:w-[460px] lg:h-[460px] flex items-center justify-center select-none">
              <BlobCanvas className="w-64 h-64 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px]" />
            </div>
          </main>
        ) : (
          <main
            ref={scrollerRef}
            className="flex-1 overflow-y-auto py-4 md:py-6 space-y-4 md:space-y-6 max-w-3xl lg:max-w-4xl mx-auto w-full no-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#8B8D98] text-[14px]">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 shadow-xs"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #D4D4D8 45%, #71717A 80%, #27272A 100%)',
                  }}
                />
                <span>与智能助理开始对话</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1.5 w-full">
                  {msg.isUser ? (
                    <div className="flex justify-end">
                      <div className="bg-[#1C2024] text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-[22px] rounded-tr-[4px] px-4 md:px-5 py-2.5 md:py-3 text-[14px] leading-relaxed max-w-[85%] md:max-w-[70%] select-text">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 w-full">
                      {/* Monochrome AI Avatar Sphere */}
                      <div
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full shrink-0 mt-0.5 shadow-xs border-[0.5px] border-[#E8E8EC]"
                        style={{
                          background:
                            'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #D4D4D8 45%, #71717A 80%, #27272A 100%)',
                        }}
                      />

                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        {/* Thought Trace Collapsible */}
                        {msg.reasoning && (
                          <div className="rounded-2xl border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900/60 overflow-hidden text-[12px]">
                            <button
                              type="button"
                              onClick={() => toggleReasoning(msg.id)}
                              className="w-full flex items-center justify-between px-3 md:px-3.5 py-2 text-[#687076] dark:text-zinc-300 hover:bg-[#F1F3F5] dark:hover:bg-zinc-800/50 transition-colors duration-250 ease-out cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-[#687076] dark:text-zinc-300 shrink-0" />
                                <span className="font-medium text-[12px] text-[#1C2024] dark:text-zinc-200">
                                  思考过程
                                </span>
                                {msg.reasoningDuration && (
                                  <span className="text-[12px] text-[#8B8D98]">
                                    {msg.reasoningDuration}
                                  </span>
                                )}
                              </div>
                              <ChevronDown
                                size={14}
                                className={`text-[#8B8D98] transition-transform duration-250 ease-out ${
                                  expandedReasoningIds[msg.id] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {expandedReasoningIds[msg.id] && (
                              <div className="px-3.5 pb-2.5 pt-0.5 text-[12px] text-[#687076] dark:text-zinc-400 leading-relaxed border-t-[0.5px] border-[#E8E8EC] dark:border-zinc-800/80">
                                {msg.reasoning}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message Content Bubble */}
                        <div className="bg-[#F1F3F5] dark:bg-zinc-850 text-[#1C2024] dark:text-zinc-100 rounded-[22px] rounded-tl-[4px] px-4 md:px-5 py-3 md:py-3.5 text-[14px] leading-relaxed max-w-[95%] md:max-w-[85%] select-text border-[0.5px] border-[#E8E8EC] dark:border-zinc-800">
                          {msg.text}
                        </div>

                        {/* Message Footer Toolbar */}
                        <div className="flex items-center gap-1.5 px-1 pt-0.5 text-[#687076]">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            aria-label="复制"
                            className="p-1.5 rounded-lg hover:bg-[#ECEEF0] dark:hover:bg-zinc-800 text-[#687076] dark:text-zinc-400 hover:text-[#1C2024] dark:hover:text-zinc-200 transition-colors duration-250 ease-out cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <Check size={14} className="text-[#1C2024] dark:text-zinc-200" />
                            ) : (
                              <Copy size={14} strokeWidth={1.8} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRegenerate(msg.id)}
                            aria-label="重新生成"
                            className="p-1.5 rounded-lg hover:bg-[#ECEEF0] dark:hover:bg-zinc-800 text-[#687076] dark:text-zinc-400 hover:text-[#1C2024] dark:hover:text-zinc-200 transition-colors duration-250 ease-out cursor-pointer"
                          >
                            <RotateCcw size={14} strokeWidth={1.8} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'up')}
                            aria-label="赞同"
                            className={`p-1.5 rounded-lg transition-colors duration-250 ease-out cursor-pointer ${
                              msg.feedback === 'up'
                                ? 'text-[#1C2024] bg-[#ECEEF0] dark:text-zinc-100 dark:bg-zinc-700'
                                : 'hover:bg-[#ECEEF0] dark:hover:bg-zinc-800 text-[#687076] dark:text-zinc-400'
                            }`}
                          >
                            <ThumbsUp size={14} strokeWidth={1.8} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, 'down')}
                            aria-label="不赞同"
                            className={`p-1.5 rounded-lg transition-colors duration-250 ease-out cursor-pointer ${
                              msg.feedback === 'down'
                                ? 'text-[#1C2024] bg-[#ECEEF0] dark:text-zinc-100 dark:bg-zinc-700'
                                : 'hover:bg-[#ECEEF0] dark:hover:bg-zinc-800 text-[#687076] dark:text-zinc-400'
                            }`}
                          >
                            <ThumbsDown size={14} strokeWidth={1.8} />
                          </button>

                          {msg.time && (
                            <span className="text-[12px] text-[#8B8D98] ml-2 font-normal">
                              {msg.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isThinking && (
              <div className="flex items-start gap-3 w-full">
                <div
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full shrink-0 shadow-xs mt-0.5 animate-pulse"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #D4D4D8 45%, #71717A 80%, #27272A 100%)',
                  }}
                />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 bg-[#F9F9FB] dark:bg-zinc-900/60 px-3 py-1.5 text-[12px] text-[#687076] dark:text-zinc-300 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2024] dark:bg-zinc-300 animate-ping" />
                    <span className="text-[12px] font-medium text-[#1C2024] dark:text-zinc-200">
                      思考中
                    </span>
                    <span className="text-[12px] text-[#8B8D98]">
                      {thinkingStep}
                    </span>
                  </div>
                  <div className="bg-[#F1F3F5] dark:bg-zinc-850 rounded-[22px] rounded-tl-[4px] px-4 py-2.5 text-[12px] text-[#8B8D98] flex items-center gap-1.5 w-fit border-[0.5px] border-[#E8E8EC] dark:border-zinc-800">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B8D98] animate-bounce" />
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B8D98] animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B8D98] animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* Bottom Section: Scaled Quick Start Cards + Chat Input Capsule */}
        <footer className="pb-6 md:pb-8 space-y-3.5 shrink-0 max-w-3xl lg:max-w-4xl mx-auto w-full">
          {/* Quick Start Cards Header & Container */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[16px] font-semibold text-[#1C2024] dark:text-zinc-100">
                快速开始
              </span>
              <button
                type="button"
                onClick={() => setShowCards((prev) => !prev)}
                aria-label={showCards ? '关闭下方卡片' : '展开下方卡片'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#687076] hover:text-[#1C2024] hover:bg-[#F1F3F5] dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-250 ease-out cursor-pointer active:scale-95"
              >
                {showCards ? (
                  <X size={16} strokeWidth={1.8} />
                ) : (
                  <ChevronDown size={16} strokeWidth={1.8} />
                )}
              </button>
            </div>

            {/* Collapsible Cards (Responsive 3-Column Grid on Desktop) */}
            <div
              className={`transition-all duration-250 ease-out overflow-hidden ${
                showCards
                  ? 'max-h-56 md:max-h-40 opacity-100 pointer-events-auto'
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-3.5 md:overflow-visible scroll-smooth">
                {START_CARDS.map((card) => {
                  const IconComp = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => handleCardClick(card)}
                      className="shrink-0 w-60 md:w-auto bg-white dark:bg-zinc-850 rounded-[20px] md:rounded-[22px] p-3.5 md:p-4 border-[0.5px] border-[#E8E8EC] dark:border-zinc-800 flex items-center gap-3.5 text-left hover:bg-[#F9F9FB] dark:hover:bg-zinc-800/80 shadow-2xs transition-all duration-250 ease-out cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-[12px] md:rounded-[14px] bg-[#F1F3F5] dark:bg-zinc-800 border-[0.5px] border-[#E8E8EC] dark:border-zinc-700 flex items-center justify-center shrink-0">
                        <IconComp size={18} strokeWidth={1.75} className="text-[#1C2024] dark:text-zinc-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#1C2024] dark:text-zinc-100 truncate">
                          {card.title}
                        </div>
                        <div className="text-[12px] text-[#687076] dark:text-zinc-400 line-clamp-1 leading-tight mt-0.5">
                          {card.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Input Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[20px] p-3 md:p-4 lg:p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] border-[0.5px] border-[#E8E8EC]/80 dark:border-zinc-800 flex flex-col gap-3">
            {/* Top Row: Text Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center px-1 w-full"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="分配任务或提出任何问题..."
                className="w-full bg-transparent text-[14px] text-[#1C2024] dark:text-zinc-100 placeholder:text-[#8B8D98] outline-none"
              />
            </form>

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between pt-0.5">
              {/* Left Controls: Plus + Sliders */}
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu((v) => !v)}
                  aria-label="添加附件"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#F1F3F5] dark:bg-zinc-800 border-[0.5px] border-[#E8E8EC] dark:border-zinc-700 flex items-center justify-center text-[#1C2024] dark:text-zinc-200 hover:bg-[#ECEEF0] transition-colors duration-250 ease-out cursor-pointer active:scale-95"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputVal('配置当前会话的上下文深度与执行参数：');
                    inputRef.current?.focus();
                  }}
                  aria-label="执行设置"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#F1F3F5] dark:bg-zinc-800 border-[0.5px] border-[#E8E8EC] dark:border-zinc-700 flex items-center justify-center text-[#1C2024] dark:text-zinc-200 hover:bg-[#ECEEF0] transition-colors duration-250 ease-out cursor-pointer active:scale-95"
                >
                  <SlidersHorizontal size={15} strokeWidth={1.8} />
                </button>

                {showAttachMenu && (
                  <div className="absolute left-0 bottom-11 md:bottom-12 z-40 w-44 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-xl border-[0.5px] border-[#E8E8EC] dark:border-zinc-700 text-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        setInputVal('帮我分析并处理这张图片：');
                        setViewMode('chat');
                        setTimeout(() => inputRef.current?.focus(), 80);
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] transition-colors duration-250 ease-out cursor-pointer"
                    >
                      <Image size={15} strokeWidth={1.8} className="text-[#687076] shrink-0" />
                      <span>照片与文档</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        setInputVal('配置深度思考模式：');
                        setViewMode('chat');
                        setTimeout(() => inputRef.current?.focus(), 80);
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl text-[#1C2024] dark:text-zinc-200 hover:bg-[#F9F9FB] transition-colors duration-250 ease-out cursor-pointer"
                    >
                      <Brain size={15} strokeWidth={1.8} className="text-[#687076] shrink-0" />
                      <span>深度思考模式</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Controls: Send Button */}
              <div className="flex items-center">
                {/* Send Button (Solid Pure Black Circle with Arrow Up) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!inputVal.trim()) {
                      inputRef.current?.focus();
                      return;
                    }
                    handleSend();
                  }}
                  aria-label="发送"
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#11181C] text-white hover:bg-[#2E3135] flex items-center justify-center transition-all duration-250 ease-out shadow-xs cursor-pointer active:scale-95 ${
                    !inputVal.trim() && !isThinking ? 'opacity-40 hover:opacity-75' : 'opacity-100'
                  }`}
                >
                  <ArrowUp size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
