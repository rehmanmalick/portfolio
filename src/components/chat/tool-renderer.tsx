// src/components/chat/tool-renderer.tsx
import { motion } from "framer-motion";
import AllProjects from "../projects/AllProjects";

interface ToolRendererProps {
  toolInvocations: any[]; // Replace with actual type from your AI SDK
  messageId: string;
}

export default function ToolRenderer({ toolInvocations, messageId }: ToolRendererProps) {
  return (
    <div className="w-full overflow-hidden transition-all duration-300">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName } = tool;

        // Return specialized components based on tool name
        switch (toolName) {
          case "getProjects":
            return (
              <div key={toolCallId} className="w-full overflow-hidden">
                <AllProjects />
              </div>
            );

          // Add more tool-specific renderers as needed
          case "getResume":
            return (
              <div key={toolCallId} className="w-full p-4 bg-secondary/10 rounded-lg">
                <h3 className="text-lg font-medium mb-2">My Resume</h3>
                {/* Resume component would go here */}
                <p>Resume content...</p>
              </div>
            );

          case "getContact":
            return (
              <div key={toolCallId} className="w-full p-4 bg-secondary/10 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                {/* Contact component would go here */}
                <p>Contact info...</p>
              </div>
            );

          // Default renderer for other tools
          default:
            return (
              <div key={toolCallId} className="w-full p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  {typeof tool.result === 'object' ? (
                    <pre className="bg-secondary/20 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(tool.result)}</p>
                  )}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}