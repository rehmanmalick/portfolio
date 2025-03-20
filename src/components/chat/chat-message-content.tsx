// src/components/chat/chat-message-content.tsx
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import ButtonWithTooltip from "../ui/button-with-tooltip";

export type ChatMessageContentProps = {
  message: Message;
  isLast: boolean;
  isLoading: boolean | undefined;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  showActions?: boolean;
  skipToolRendering?: boolean; // New prop to control tool rendering
};

const CodeBlock = ({ content }: { content: string }) => {
  // Extract language if present in the first line
  const firstLineBreak = content.indexOf('\n');
  const firstLine = content.substring(0, firstLineBreak).trim();
  const language = firstLine || 'text';
  const code = firstLine ? content.substring(firstLineBreak + 1) : content;

  return (
    <div className="my-4 rounded-md overflow-hidden">
      {language !== 'text' && (
        <div className="bg-secondary border-b text-secondary-foreground text-xs px-4 py-1 rounded-t-md">
          {language}
        </div>
      )}
      <pre className="bg-accent/80 text-accent-foreground px-4 py-3 rounded-b-md overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );
};

export default function ChatMessageContent({
  message,
  isLast,
  isLoading,
  reload,
  addToolResult,
  showActions = true,
  skipToolRendering = false
}: ChatMessageContentProps) {
  //const [isCopied, setIsCopied] = useState<boolean>(false);

  //const handleCopy = () => {
  //  navigator.clipboard.writeText(message.content);
  //  setIsCopied(true);
  //  setTimeout(() => setIsCopied(false), 1500);
  //};

  const renderContent = () => {
    return message.parts?.map((part, partIndex) => {
      switch (part.type) {
        case "text": {
          if (!part.text) return null;

          // Split content by code block markers
          const contentParts = part.text.split("```");

          return (
            <div key={partIndex} className="space-y-4">
              {contentParts.map((content, i) => (
                i % 2 === 0 ? (
                  // Regular text content
                  <div key={`text-${i}`} className="prose dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </Markdown>
                  </div>
                ) : (
                  // Code block content
                  <CodeBlock key={`code-${i}`} content={content} />
                )
              ))}
            </div>
          );
        }
        
        case "tool-invocation": {
          if (skipToolRendering) return null;
          
          const { toolCallId, toolName, state } = part.toolInvocation as {
            toolCallId: string;
            toolName: string;
            state: string;
            args?: Record<string, any>;
            result?: any;
          };

          if (state === "partial-call") {
            return (
              <div key={toolCallId} className="my-3 p-3 bg-secondary/20 rounded-lg border border-secondary/30 animate-pulse">
                <p className="text-sm font-medium text-secondary-foreground/70">
                  Preparing to use {toolName}...
                </p>
              </div>
            );
          }

          if (state === "call") {
            return (
              <div key={toolCallId} className="my-3 p-4 bg-secondary/30 rounded-lg border border-secondary/40">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{toolName}</p>
                  <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                    Running...
                  </span>
                </div>
              </div>
            );
          }

          // We'll skip "result" state rendering, as it's handled by ToolRenderer
          return null;
        }
        default:
          return null;
      }
    });
  };

  //const renderActionButtons = () =>
  //  showActions && message.role === "assistant" && (
  //    <div className="pt-3 flex gap-2 items-center text-muted-foreground">
  //      {!isLoading && (
  //        <ButtonWithTooltip side="bottom" toolTipText="Copy response">
  //          <Button onClick={handleCopy} variant="ghost" size="icon" className="h-8 w-8">
  //            {isCopied ? (
  //              <CheckIcon className="w-4 h-4 text-green-500" />
  //            ) : (
  //              <CopyIcon className="w-4 h-4" />
  //            )}
  //          </Button>
  //        </ButtonWithTooltip>
  //      )}
  //      {!isLoading && isLast && (
  //        <ButtonWithTooltip side="bottom" toolTipText="Regenerate response">
  //          <Button
  //            variant="ghost"
  //            size="icon"
  //            className="h-8 w-8"
  //            onClick={() => reload()}
  //          >
  //            <RefreshCcw className="w-4 h-4" />
  //          </Button>
  //        </ButtonWithTooltip>
  //      )}
  //    </div>
  //  );

  return (
    <>
      {renderContent()}
      {/*{renderActionButtons()}*/}
    </>
  );
}