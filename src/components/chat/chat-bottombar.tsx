// src/components/chat/chat-bottombar.tsx
"use client";

import { ChatRequestOptions } from "ai";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useEffect } from "react";

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  isToolInProgress: boolean;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 pb-8"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full"
      >
        <div className="flex items-center mx-auto pl-6 pr-2 py-2 bg-[#ECECF0] rounded-full border border-[#E5E5E9]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              isToolInProgress
                ? "Tool is in progress..."
                : "Ask me anything about myself, my skills, or my projects"
            }
            className="w-full bg-transparent border-none text-black text-md focus:outline-none placeholder:text-gray-500"
            disabled={isToolInProgress || isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isToolInProgress}
            className="flex items-center justify-center p-2 rounded-full bg-[#0171E3] text-white disabled:opacity-50"
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault();
                stop();
              }
            }}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}