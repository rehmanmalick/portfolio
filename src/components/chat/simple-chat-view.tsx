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

  // Only display the first tool (if any)
  const currentTool = toolInvocations.length > 0 ? [toolInvocations[0]] : [];

  const hasTextContent = message.content.trim().length > 0;
  const hasTools = currentTool.length > 0;

  return (
    <div className="flex h-full w-full flex-col gap-4 px-4">
      {/* Content container with better height distribution */}
      <div className="flex h-full w-full flex-col gap-4">
        {/* Tool invocation result - only the first one is displayed */}
        {hasTools && (
          <motion.div
            {...MOTION_CONFIG}
            className="w-full"
            style={{
              flex: hasTextContent ? '0 0 auto' : '1 0 auto',
              maxHeight: hasTextContent ? '80%' : '100%',
            }}
          >
            <ToolRenderer
              toolInvocations={currentTool}
              messageId={message.id || 'current-msg'}
            />

          </motion.div>
        )}

        {/* Text content with custom minimal scrollbar */}
        {hasTextContent && (
          <motion.div
            {...MOTION_CONFIG}
            className="w-full"
            style={{
              flex: '1 1 auto',
              minHeight: hasTools ? '80px' : 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="custom-scrollbar w-full flex-1 overflow-y-auto"
              style={{
                maxHeight: hasTools ? '40vh' : 'min(500px, 60vh)',
              }}
            >
              <ChatBubble variant="received" className="w-full">
                <ChatBubbleMessage className="w-full">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
