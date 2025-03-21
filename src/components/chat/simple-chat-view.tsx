// src/components/chat/simple-chat-view.tsx
import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import ChatMessageContent from "./chat-message-content";
import ToolRenderer from "./tool-renderer";

interface SimpleChatViewProps {
  messages: Message[];
  isLoading: boolean;
  loadingSubmit?: boolean;
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
    ease: "easeOut"
  },
};

export default function SimpleChatView({
  messages,
  isLoading,
  loadingSubmit,
  reload,
  addToolResult,
}: SimpleChatViewProps) {
  // Keep track of which messages have expanded text
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col px-4 min-h-0 overflow-hidden">
      {messages.map((message, index) => {
        if (message.role !== "assistant") return null;

        // Extract tool invocations that are in "result" state
        const toolInvocations = message.parts
          ?.filter(part =>
            part.type === "tool-invocation" &&
            part.toolInvocation?.state === "result"
          )
          .map(part => part.type === "tool-invocation" ? part.toolInvocation : null)
          .filter(Boolean) || [];

        // Check if message has text content without tool invocations
        const hasTextContent = message.content.trim().length > 0;
        const hasTools = toolInvocations.length > 0;
        const messageId = message.id || `msg-${index}`;
        const isExpanded = expandedMessageIds.has(messageId);

        return (
          <div key={messageId} className="flex flex-col min-h-0 w-full gap-2">
            {/* Tool invocation results - rendered outside chat bubbles */}
            {hasTools && (
              <motion.div
                {...MOTION_CONFIG}
                className={`w-full transition-all duration-300 ease-in-out ${hasTextContent && !isExpanded ? 'flex-grow' : 'flex-none'
                  }`}
              >
                <ToolRenderer
                  toolInvocations={toolInvocations}
                  messageId={messageId}
                />
              </motion.div>
            )}

            {/* Regular text message content - collapsible when tools are present */}
            {hasTextContent && (
              <div
                className={`relative w-full transition-all duration-300 ease-in-out overflow-y-auto ${hasTools && !isExpanded ? 'max-h-36' : 'max-h-[500px]'
                  }`}
              >
                <motion.div
                  {...MOTION_CONFIG}
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage>
                      <ChatMessageContent
                        message={message}
                        isLast={index === messages.length - 1}
                        isLoading={isLoading}
                        reload={reload}
                        addToolResult={addToolResult}
                        skipToolRendering={true}
                      />
                    </ChatBubbleMessage>
                  </ChatBubble>
                </motion.div>

                {/* Expand/collapse button overlay for text when tools are present */}
                {hasTools && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent flex justify-center items-end">
                    <button
                      onClick={() => toggleMessageExpansion(messageId)}
                      className="text-xs text-muted-foreground hover:text-foreground p-1 rounded-md mb-1 bg-secondary/20 px-3 py-1"
                    >
                      {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {loadingSubmit && (
        <motion.div {...MOTION_CONFIG} className="px-4">
          <ChatBubble variant="received">
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        </motion.div>
      )}
    </div>
  );
}