import { ChatRequestOptions } from "ai";
import { Message } from "ai/react";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ButtonWithTooltip from "../ui/button-with-tooltip";
import { Button } from "../ui/button";

export type ChatMessageContentProps = {
  message: Message;
  isLast: boolean;
  isLoading: boolean | undefined;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  showActions?: boolean;
};

export default function ChatMessageContent({
  message,
  isLast,
  isLoading,
  reload,
  addToolResult,
  showActions = true
}: ChatMessageContentProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const renderParts = () => {
    return message.parts?.map((part, index) => {
      switch (part.type) {
        case "text":
          return (
            <Markdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => (
                  <p className="my-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 my-1" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="my-1" {...props} />
                ),
                code({
                  node,
                  inline,
                  className,
                  children,
                  ...props
                }: {
                  node: any
                  inline: boolean
                  className: string
                  children: any
                  [key: string]: any
                }) {
                  const isBlock = !inline
                  if (isBlock) {
                    return (
                      <pre className="bg-accent text-accent-foreground p-4 rounded-md overflow-auto my-2" {...props}>
                        <code>{children}</code>
                      </pre>
                    )
                  }
                  return (
                    <code className="bg-accent text-accent-foreground px-1 py-0.5 rounded" {...props}>
                      {children}
                    </code>
                  )
                },
                a: ({ node, href, children, ...props }) => {
                  return (
                    <a
                      href={href}
                      className="underline text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {part.text}
            </Markdown>
          );
        case "tool-invocation": {
          const { toolCallId, toolName, state, result } = part.toolInvocation as {
            toolCallId: string;
            toolName: string;
            state: string;
            result?: string
          };

          // This is a placeholder for future tool implementation
          // Will be customized based on specific tools
          if (state === "partial-call" || state === "call") {
            return (
              <div key={toolCallId} className="my-2 p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium">{toolName} is running...</p>
              </div>
            );
          }

          if (state === "result") {
            return (
              <div key={toolCallId} className="my-2 p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium">{toolName}</p>
                <p>{String(result)}</p>
              </div>
            );
          }
          return null;
        }
        default:
          return null;
      }
    });
  };

  const renderActionButtons = () =>
    showActions && message.role === "assistant" && (
      <div className="pt-3 flex gap-1 items-center text-muted-foreground">
        {!isLoading && (
          <ButtonWithTooltip side="bottom" toolTipText="Copy">
            <Button onClick={handleCopy} variant="ghost" size="icon" className="h-6 w-6">
              {isCopied ? (
                <CheckIcon className="w-3.5 h-3.5 transition-all" />
              ) : (
                <CopyIcon className="w-3.5 h-3.5 transition-all" />
              )}
            </Button>
          </ButtonWithTooltip>
        )}
        {!isLoading && isLast && (
          <ButtonWithTooltip side="bottom" toolTipText="Regenerate">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => reload()}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </Button>
          </ButtonWithTooltip>
        )}
      </div>
    );

  return (
    <>
      {renderParts()}
      {renderActionButtons()}
    </>
  );
}