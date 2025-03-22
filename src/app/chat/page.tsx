'use client';

import { useChat } from '@ai-sdk/react';
import { ChatRequestOptions } from 'ai';
import { Message } from 'ai/react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatMessageContent from '@/components/chat/chat-message-content';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import Helper from '@/components/chat/helper';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';

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
  } = useChat({
    id,
    initialMessages,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: () => {
      setLoadingSubmit(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      console.error('Chat error:', error.message, error.cause);
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: (tool) => {
      // Future tool call handling
      const toolName = tool.toolCall.toolName;
      if (toolName) {
        toast.success(`Running: ${toolName}`);
      }
    },
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Get only the most recent messages to display
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

    // Check if the latest AI message has any active tools
    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    // Only show AI message if it exists AND there's no user message after it
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isToolInProgress) return;

    // Clear any existing AI messages immediately when a new message is sent
    const currentMessages = [...messages];
    const newMessages = currentMessages.filter((m) => m.role !== 'assistant');
    setMessages(newMessages);

    setLoadingSubmit(true);

    const requestOptions: ChatRequestOptions = {
      body: {},
    };

    handleSubmit(e, requestOptions);
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
  };

  return (
    <div className="container mx-auto grid h-screen max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden px-2">
      {/* Avatar area - dynamic sizing based on tool status */}
      <div
        className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-2 pb-0' : 'py-6'}`}
      >
        <div className="flex justify-center">
          <div
            className={`bg-secondary flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-16 w-16' : 'h-32 w-32'}`}
          >
            <span className="text-secondary-foreground">Avatar</span>
          </div>
        </div>

        {/* User message bubble - only shown when waiting for AI response */}
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

      {/* Main content area - flexible height */}
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

      {/* Input area - fixed height */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <Helper setInput={setInput} />
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
