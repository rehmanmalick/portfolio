'use client';

import { Message } from 'ai/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type ChatMessageContentProps = {
  message: Message;
  isLast?: boolean;
  isLoading?: boolean;
  reload?: () => Promise<string | null | undefined>;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
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

export default function ChatMessageContent({ message }: ChatMessageContentProps) {
  // Only handle text parts
  const renderContent = () => {
    return message.parts?.map((part, partIndex) => {
      if (part.type !== "text" || !part.text) return null;
      
      // Split content by code block markers
      const contentParts = part.text.split("```");

      return (
        <div key={partIndex} className="space-y-4 w-full">
          {contentParts.map((content, i) => (
            i % 2 === 0 ? (
              // Regular text content
              <div key={`text-${i}`} className="prose dark:prose-invert max-w-none break-words w-full">
                <Markdown 
                  remarkPlugins={[remarkGfm]} 
                  components={{
                    p: ({ children }) => <p className="break-words whitespace-normal overflow-wrap-normal">{children}</p>
                  }}
                >
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
    });
  };

  return <>{renderContent()}</>;
}