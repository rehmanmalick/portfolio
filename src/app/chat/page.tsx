"use client";

import { useChat } from '@ai-sdk/react';
import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import React from "react";
import { toast } from "sonner";

import ChatBottombar from "@/components/chat/chat-bottombar";
import SimpleChatView from "@/components/chat/simple-chat-view";

import ChatMessageContent from "@/components/chat/chat-message-content";
import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";

export interface ChatProps {
  id?: string;
  initialMessages?: Message[] | [];
}

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
      console.error("Chat error:", error.message, error.cause);
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
  
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  // Check for messages to display in the main chat area and above input
  const { displayAIMessages, latestUserMessage } = React.useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(m => m.role === 'assistant');
    const latestUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
    
    const result = {
      displayAIMessages: [] as Message[],
      latestUserMessage: latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null
    };
    
    // Only show AI message if it exists AND there's no user message after it
    // This ensures AI message disappears immediately when user sends a new message
    if (latestAIMessageIndex !== -1 && latestAIMessageIndex > latestUserMessageIndex) {
      result.displayAIMessages.push(messages[latestAIMessageIndex]);
    }
    
    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m: Message) =>
      m.role === "assistant" &&
      m.toolInvocations?.some((tool) => !("result" in tool))
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Clear any existing AI messages immediately when a new message is sent
    const currentMessages = [...messages];
    const newMessages = currentMessages.filter(m => m.role !== 'assistant');
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
    <div className="flex flex-col w-full max-w-3xl h-screen mx-auto">
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Avatar placeholder - will be replaced with animated Memoji */}
        <div className="flex justify-center py-6">
          <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground">Avatar</span>
          </div>
        </div>
        
        {/* Main chat area - AI responses only */}
        <div className="flex-1 overflow-y-auto">
          <SimpleChatView
            messages={displayAIMessages}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            reload={async () => {
              // Remove the last message and reload
              const updatedMessages = messages.slice(0, -1);
              setMessages(updatedMessages);

              setLoadingSubmit(true);
              return reload({
                body: {},
              });
            }}
            addToolResult={addToolResult}
          />
        </div>
        
        {/* Fixed user message area above input */}
        {latestUserMessage && (
          <div className="px-4 py-2">
            <ChatBubble variant="sent">
              <ChatBubbleMessage>
                <ChatMessageContent 
                  message={latestUserMessage} 
                  isLast={true}
                  isLoading={false}
                  reload={() => Promise.resolve(null)}
                  showActions={false}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}
        
        {/* Input area */}
        <ChatBottombar
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
          stop={handleStop}
          setInput={setInput}
          isToolInProgress={isToolInProgress}
          isMiddle={false}
        />
      </div>
    </div>
  );
}