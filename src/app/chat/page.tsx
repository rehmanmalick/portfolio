"use client";

import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { useChat } from '@ai-sdk/react';
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import ChatBottombar from "@/components/chat/chat-bottombar";
import ChatList from "@/components/chat/chat-list";


export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
}

export default function Chat({ initialMessages, id }: ChatProps) {
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
    onFinish: (message) => {
      setLoadingSubmit(false);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      console.error("Chat error:", error.message, error.cause);
      // Show the error to the user, e.g. via a toast notification
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: (tool) => {
      if (tool.toolCall.toolName == "queryDatabase") {
        toast.success("Querying database");
      } else if (tool.toolCall.toolName == "selectTable") {
        toast.success("Selecting table");
      } else if (tool.toolCall.toolName == "displayResults") {
        toast.success("Displaying results");
      }
    },
  });
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const router = useRouter();

  const isToolInProgress = messages.some(
    (m: Message) =>
      m.role === "assistant" &&
      m.toolInvocations?.some((tool) => !("result" in tool))
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoadingSubmit(true);

    const requestOptions: ChatRequestOptions = {
      body: {},
    };

    handleSubmit(e, requestOptions);
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
  };


  return (
    <div className="flex flex-col w-full max-w-3xl h-full mx-auto">
      <>
        {/*ICI JE METTRAI MON AVATAR ANIME, ETC...*/}
        
        <ChatList
          messages={messages}
          isLoading={isLoading}
          loadingSubmit={loadingSubmit}
          reload={async () => {
            removeLatestMessage();

            const requestOptions: ChatRequestOptions = {
              body: {},
            };

            setLoadingSubmit(true);
            return reload(requestOptions);
          }}
          addToolResult={addToolResult}
        />
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
      </>

    </div>
  );
}