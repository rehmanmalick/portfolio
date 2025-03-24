'use client';
import { useChat } from '@ai-sdk/react';
import { Message } from 'ai/react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic'; // Importer dynamic de Next.js

// Autres imports...
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatMessageContent from '@/components/chat/chat-message-content';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import Helper from '@/components/chat/helper';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import WelcomeModal from '@/components/welcome-modal';
import { CircleHelp, Info, Settings } from 'lucide-react';

// Créer un composant ClientOnly qui ne sera rendu que côté client
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Créer un composant Avatar qui gère la détection d'iOS et l'affichage approprié
const Avatar = dynamic(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef, isTalking }) => {
      // Cette fonction ne s'exécutera que côté client
      const isIOS = () => {
        // Méthodes multiples de détection
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        const maxTouchPoints = window.navigator.maxTouchPoints || 0;

        // Vérification basée sur userAgent
        const isIOSByUA =
          /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

        // Vérification basée sur platform
        const isIOSByPlatform = /iPad|iPhone|iPod/.test(platform);

        // Vérification pour iPad Pro
        const isIPadOS =
          platform === 'MacIntel' && maxTouchPoints > 1 && !window.MSStream;

        // Vérification supplémentaire pour Safari
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

        return isIOSByUA || isIOSByPlatform || isIPadOS || isSafari;
      };

      // Utiliser JSX conditionnel en fonction de la détection
      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-24 w-24' : 'h-32 w-32'}`}
        >
          {isIOS() ? (
            <img
              src="/landing-memojis.png"
              alt="iOS avatar"
              className="h-full w-full scale-[2.2] object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full scale-[2.2] object-contain"
              muted
              playsInline
              loop
            >
              <source src="/final_memojis.webm" type="video/webm" />
              <source src="/final_memojis_ios.mp4" type="video/mp4" />
            </video>
          )}
        </div>
      );
    }),
  { ssr: false }
); // Désactiver le rendu côté serveur

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const Chat = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
        setIsTalking(true);
        if (videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error('Failed to play video:', error);
          });
        }
      }
    },
    onFinish: () => {
      setLoadingSubmit(false);
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      console.error('Chat error:', error.message, error.cause);
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: (tool) => {
      const toolName = tool.toolCall.toolName;
      console.log('Tool call:', toolName);
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  const submitQuery = (query) => {
    if (!query.trim() || isToolInProgress) return;
    setLoadingSubmit(true);
    append({
      role: 'user',
      content: query,
    });
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }

    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted]);

  useEffect(() => {
    if (videoRef.current) {
      if (isTalking) {
        videoRef.current.play().catch((error) => {
          console.error('Failed to play video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isTalking]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
    setInput('');
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
    setIsTalking(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className='relative'>
      <WelcomeModal
        trigger={
          <div className="z-10 hover:bg-accent absolute top-6 right-8 cursor-pointer rounded-2xl px-4 py-2">
            <Info className="text-accent-foreground h-8" />
          </div>
        }
      />

      <div className="relative container mx-auto grid h-screen max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden px-2">
        <div
          className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-6'}`}
        >
          <div className="flex justify-center">
            <div className="relative cursor-pointer">
              <ClientOnly>
                <WelcomeModal
                  trigger={
                    <Avatar
                      hasActiveTool={hasActiveTool}
                      videoRef={videoRef}
                      isTalking={isTalking}
                    />
                  }
                />
              </ClientOnly>
            </div>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div {...MOTION_CONFIG} className="flex px-4 pt-4">
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                      reload={() => Promise.resolve(null)}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {currentAIMessage ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div key="loading" {...MOTION_CONFIG} className="px-4">
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto flex flex-col items-center gap-5">
          <Helper setInput={setInput} submitQuery={submitQuery} />
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
    </div>
  );
};

export default Chat;
