'use client';

import { Message } from 'ai/react';
import { motion } from 'framer-motion';
import { ChatRequestOptions } from 'ai';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimplifiedChatViewProps {
  message: Message;
  isLoading: boolean;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
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

export function SimplifiedChatView({
  message,
  isLoading,
  reload,
  addToolResult,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  // Extract tool invocations that are in "result" state
  const toolInvocations =
    message.parts
      ?.filter(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state === 'result'
      )
      .map((part) =>
        part.type === 'tool-invocation' ? part.toolInvocation : null
      )
      .filter(Boolean) || [];

  const hasTextContent = message.content.trim().length > 0;
  const hasTools = toolInvocations.length > 0;

  return (
    <div className="flex w-full flex-col px-4 gap-2">
      {/* Tool invocation results - displayed at the top */}
      {hasTools && (
        <motion.div
          {...MOTION_CONFIG}
          className="w-full transition-all duration-300 ease-in-out"
          style={{ flex: hasTextContent ? '0 0 60%' : '1 0 auto' }}
        >
          <ToolRenderer
            toolInvocations={toolInvocations}
            messageId={message.id || 'current-msg'}
          />
        </motion.div>
      )}

      {/* Text content in a ScrollArea for overflow */}
      {hasTextContent && (
        <motion.div
          {...MOTION_CONFIG}
          className="w-full transition-all duration-300 ease-in-out"
          style={{ flex: hasTools ? '0 0 40%' : '1 0 auto' }}
        >
          <ScrollArea 
            className={`rounded-lg pr-2 ${hasTools ? 'h-[200px]' : 'max-h-[500px]'}`}
          >
            <div className="pb-2">
              <ChatBubble variant="received">
                <ChatBubbleMessage>
                  <ChatMessageContent
                    message={message}
                    isLast={true}
                    isLoading={isLoading}
                    reload={reload}
                    addToolResult={addToolResult}
                    skipToolRendering={true}
                  />
                </ChatBubbleMessage>
              </ChatBubble>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
}