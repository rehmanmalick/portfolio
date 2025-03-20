import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { motion } from "framer-motion";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import ChatMessageContent from "./chat-message-content";

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
  return (
    <div className="w-full px-4 py-6 space-y-6 bg-pink-100">
      {messages.map((message, index) => (
        message.role === "assistant" && (
          <motion.div
            key={message.id || index}
            {...MOTION_CONFIG}
            className="flex flex-col gap-2 whitespace-pre-wrap"
          >
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                src="/favicon.svg"
                width={4}
                height={4}
                className="object-contain"
              />
              <ChatBubbleMessage>
                <ChatMessageContent
                  message={message}
                  isLast={index === messages.length - 1}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </motion.div>
        )
      ))}

      {loadingSubmit && (
        <motion.div {...MOTION_CONFIG}>
          <ChatBubble variant="received">
            <ChatBubbleAvatar
              src="/favicon.svg"
              width={4}
              height={4}
              className="object-contain"
            />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        </motion.div>
      )}
    </div>
  );
}