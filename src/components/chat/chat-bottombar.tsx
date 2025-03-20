"use client";

import { ChatRequestOptions } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, CornerDownLeft, Square } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { ChatInput } from "../ui/chat/chat-input";

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  isToolInProgress: boolean;
  isMiddle: boolean;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
  isToolInProgress,
  isMiddle,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
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
      className="w-full items-center relative px-4 py-4"
    >
      <AnimatePresence initial={false}>
        <form
          onSubmit={handleSubmit}
          className="w-full items-center flex flex-col bg-card rounded-xl shadow-md"
        >
          <ChatInput
            value={input}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder={
              isToolInProgress
                ? "Tool is in progress..."
                : "Ask me anything about myself, my skills, or my projects"
            }
            className="resize-none border-none max-h-40 px-6 pt-4 shadow-none rounded-t-xl text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed"
            disabled={isToolInProgress}
          />

          <div className="flex w-full items-center justify-between bg-card rounded-b-xl">
            {isLoading ? (
              <div className="flex w-full justify-end p-3">
                <Button
                  className="rounded-full bg-black hover:opacity-80 hover:bg-black"
                  size="icon"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    stop();
                  }}
                >
                  <Square className="w-4 h-4" strokeWidth={2.75} />
                </Button>
              </div>
            ) : (
              <div className="flex w-full justify-between items-center p-3">
                {/* Enter Shortcut Hint */}
                <span className="text-xs text-muted-foreground pl-3 py-1 rounded-lg flex items-center gap-1">
                  <span>Press <span className="font-semibold">Enter</span> to send</span>
                  <CornerDownLeft className="w-3 h-3" />
                </span>

                {/* Send button */}
                <Button
                  className="rounded-full bg-black hover:opacity-80 hover:bg-black"
                  size="icon"
                  type="submit"
                  disabled={
                    isLoading ||
                    !input.trim() ||
                    isToolInProgress
                  }
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.75} />
                </Button>
              </div>
            )}
          </div>
        </form>
      </AnimatePresence>
    </motion.div>
  );
}