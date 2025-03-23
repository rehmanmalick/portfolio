'use client';

import { useChat } from '@ai-sdk/react';
import { ChatRequestOptions } from 'ai';
import { Message } from 'ai/react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatMessageContent from '@/components/chat/chat-message-content';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import Helper from '@/components/chat/helper';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import WelcomeModal from '@/components/welcome-modal';
import { Button } from '@/components/ui/button';

export interface ChatProps {
  id?: string;
  initialMessages?: Message[] | [];
}

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

export default function Chat({ initialMessages = [], id }: ChatProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
    id,
    initialMessages,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
        // Start playing the video when response begins
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
      // Stop the video when response ends
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
    (m: Message) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  // Directly append a message and trigger the AI response
  const submitQuery = (query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setLoadingSubmit(true);

    // Use the append method from useChat which correctly handles adding a user message
    // and triggering the AI response
    append({
      role: 'user',
      content: query,
    });
  };

  useEffect(() => {
    if (videoRef.current) {
      // Set up video but don't automatically play it
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      // Initially pause the video
      videoRef.current.pause();
    }

    // Submit initial query from URL parameter if present and not already submitted
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);

      // Set the input field to show the query
      setInput('');

      // Submit the query directly
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted]);

  // Update video playback when isLoading or isTalking changes
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isToolInProgress) return;

    // Use the same submitQuery function for consistency
    submitQuery(input);

    // Clear input after submission
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
    <div className="container mx-auto grid h-screen max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden px-2">
      <div
        className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-6'}`}
      >
        <div className="flex justify-center">
          {/* Replace Link with WelcomeModal */}
          <div className="relative cursor-pointer">
            <WelcomeModal
              trigger={
                <div
                  className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-24 w-24' : 'h-32 w-32'}`}
                >
                  <video
                    ref={videoRef}
                    src="/final_memojis.webm"
                    className="h-full w-full scale-[2.2] object-contain"
                    muted
                    playsInline
                  />
                </div>
              }
            />
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
        {/* Pass submitQuery to Helper component */}
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
  );
}
