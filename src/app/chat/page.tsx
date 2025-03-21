'use client';

import { useChat } from '@ai-sdk/react';
import { ChatRequestOptions } from 'ai';
import { Message } from 'ai/react';
import React from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import SimpleChatView from '@/components/chat/simple-chat-view';

import ChatMessageContent from '@/components/chat/chat-message-content';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import Helper from '@/components/chat/helper';

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

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  // Check for messages to display in the main chat area and above input
  const { displayAIMessages, latestUserMessage } = React.useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      displayAIMessages: [] as Message[],
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
    };

    // Only show AI message if it exists AND there's no user message after it
    // This ensures AI message disappears immediately when user sends a new message
    if (
      latestAIMessageIndex !== -1 &&
      latestAIMessageIndex > latestUserMessageIndex
    ) {
      result.displayAIMessages.push(messages[latestAIMessageIndex]);
    }

    return result;
  }, [messages]);

  const hasActiveTool = React.useMemo(() => {
    return displayAIMessages.some((message) =>
      message.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state === 'result'
      )
    );
  }, [displayAIMessages]);

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

    if (!input.trim()) return;

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

  // In the return section of Chat component:
  return (
    <div className="container mx-auto grid h-screen max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden px-2">
      {/* Avatar area - will shrink when tool is active */}

      <div className={`${hasActiveTool ? 'pt-2' : 'py-6'}`}>
        <div
          className={`flex justify-center transition-all duration-300 ease-in-out`}
        >
          <div
            className={`bg-secondary flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-16 w-16' : 'h-32 w-32'}`}
          >
            <span className="text-secondary-foreground">Avatar</span>
          </div>
        </div>

        {/* User message bubble */}
        {latestUserMessage && (
          <div className="flex px-4 pt-4">
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
      </div>

      {/* Main content area - flexible height */}
      <div className="flex min-h-0 flex-col overflow-hidden">
        <SimpleChatView
          messages={displayAIMessages}
          isLoading={isLoading}
          loadingSubmit={loadingSubmit}
          reload={reload}
          addToolResult={addToolResult}
        />
      </div>

      {/* User message + input area - fixed height */}
      <div className="flex flex-col items-center gap-2">
        {/* Input area */}
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
