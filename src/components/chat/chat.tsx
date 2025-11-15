'use client';
import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import HelperBoost from './HelperBoost';

// ClientOnly component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  return <>{children}</>;
};

// Avatar props
interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

// Dynamic Avatar
const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef }: AvatarProps) => {
      const isIOS = () => {
        if (typeof window === 'undefined') return false;
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const maxTouchPoints = window.navigator.maxTouchPoints || 0;

        return (
          /iPad|iPhone|iPod/.test(userAgent) ||
          /iPad|iPhone|iPod/.test(platform) ||
          (platform === 'MacIntel' && maxTouchPoints > 1) ||
          (/Safari/.test(userAgent) && !/Chrome/.test(userAgent))
        );
      };

      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${
            hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'
          }`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() => (window.location.href = '/')}
          >
            {isIOS() ? (
              <img
                src="/landing-memojis.png"
                alt="Avatar"
                className="h-full w-full scale-[1.8] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                className="h-full w-full scale-[1.8] object-contain"
                muted
                playsInline
                loop
              >
                <source src="/final_memojis.webm" type="video/webm" />
                <source src="/final_memojis_ios.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      );
    }),
  { ssr: false }
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 },
};

const Chat = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // ✅ Use the correct useChat hook
  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    setInput,
    sendMessage,
    status,
  } = useChat({
    onFinish: (message) => {
      console.log('✅ Message finished:', message);
      setLoadingSubmit(false);
      setIsTalking(false);
      videoRef.current?.pause();
    },
    onError: (error) => {
      console.error('❌ Chat error:', error);
      setLoadingSubmit(false);
      setIsTalking(false);
      videoRef.current?.pause();
      toast.error(`Error: ${error.message}`);
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages?.findLastIndex(
      (m: any) => m.role === 'assistant'
    ) ?? -1;
    const latestUserMessageIndex = messages?.findLastIndex(
      (m: any) => m.role === 'user'
    ) ?? -1;

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.toolInvocations?.some(
          (invocation: any) => invocation.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages?.some(
    (m: any) =>
      m.role === 'assistant' &&
      m.toolInvocations?.some((invocation: any) => invocation.state !== 'result')
  ) || false;

  const submitQuery = (query: string) => {
    console.log('🚀 submitQuery called with:', query);
    console.log('🔍 sendMessage exists:', !!sendMessage);
    
    if (!query.trim() || isToolInProgress) {
      console.warn('⚠️ Query rejected: empty or tool in progress');
      return;
    }
    
    if (!sendMessage) {
      console.error('❌ sendMessage function not available');
      toast.error('Chat functionality not ready. Please refresh the page.');
      return;
    }

    setLoadingSubmit(true);
    setIsTalking(true);
    videoRef.current?.play().catch(console.error);
    
    try {
      sendMessage({ role: 'user', content: query });
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
      setLoadingSubmit(false);
      setIsTalking(false);
    }
  };

  // Initialize video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }
  }, []);

  // Auto-submit from URL
  useEffect(() => {
    if (initialQuery && !autoSubmitted && sendMessage) {
      console.log('🚀 Auto-submitting query:', initialQuery);
      setAutoSubmitted(true);
      if (setInput) setInput('');
      submitQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, autoSubmitted, sendMessage]);

  // Video animation
  useEffect(() => {
    if (videoRef.current) {
      if (isTalking) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isTalking]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim() || isToolInProgress) return;
    submitQuery(input);
    if (setInput) setInput('');
  };

  const handleStop = () => {
    if (stop) stop();
    setLoadingSubmit(false);
    setIsTalking(false);
    videoRef.current?.pause();
  };

  // Provide a dummy reload function since it's not in the useChat return
  const reload = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'user');
      if (lastUserMessage) {
        submitQuery(lastUserMessage.content);
      }
    }
    return Promise.resolve(null);
  };

  const isEmptyState = !currentAIMessage && !latestUserMessage && !loadingSubmit;
  const headerHeight = hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
      </div>

      {/* Fixed Avatar Header */}
      <div
        className="fixed top-0 right-0 left-0 z-50"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            hasActiveTool ? 'pt-6 pb-0' : 'py-6'
          }`}
        >
          <div className="flex justify-center">
            <ClientOnly>
              <Avatar
                hasActiveTool={hasActiveTool}
                videoRef={videoRef}
                isTalking={isTalking}
              />
            </ClientOnly>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div
                initial={MOTION_CONFIG.initial}
                animate={MOTION_CONFIG.animate}
                exit={MOTION_CONFIG.exit}
                transition={MOTION_CONFIG.transition}
                className="mx-auto flex max-w-3xl px-4"
              >
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                      reload={reload}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                initial={MOTION_CONFIG.initial}
                animate={MOTION_CONFIG.animate}
                exit={MOTION_CONFIG.exit}
                transition={MOTION_CONFIG.transition}
                className="flex min-h-full items-center justify-center"
              >
                <ChatLanding submitQuery={submitQuery} />
              </motion.div>
            ) : currentAIMessage ? (
              <div className="pb-4">
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={isLoading}
                  reload={reload}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div
                  key="loading"
                  initial={MOTION_CONFIG.initial}
                  animate={MOTION_CONFIG.animate}
                  exit={MOTION_CONFIG.exit}
                  transition={MOTION_CONFIG.transition}
                  className="px-4 pt-18"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar */}
        <div className="sticky bottom-0 bg-white px-2 pt-3 md:px-0 md:pb-4">
          <div className="relative flex flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} setInput={setInput} />
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
            />
          </div>
        </div>

        <a
          href="https://x.com/toukoumcode"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-3 bottom-0 z-10 mb-4 hidden cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm hover:underline md:block"
        >
          @toukoum
        </a>
      </div>
    </div>
  );
};

export default Chat;