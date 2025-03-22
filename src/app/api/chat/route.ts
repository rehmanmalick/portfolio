import { openai } from '@ai-sdk/openai';
import { streamText } from "ai";
import { SYSTEM_PROMPT } from './prompt';
import { getProjects } from './tools/getProjects';
import { getPresentation } from './tools/getPresentation';
import { getResume } from './tools/getResume';
import { getContact } from './tools/getContact';

export const maxDuration = 30;

// Custom error handler to extract a meaningful error message
export function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("[CHAT-API] Incoming messages:", messages);

    messages.unshift(SYSTEM_PROMPT);

    const tools = {
      getProjects,
      getPresentation,
      getResume,
      getContact,
    };

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      toolCallStreaming: true,
      tools,
      maxSteps: 2,
    });

    // Pass the error handler to surface any errors in the stream response
    return result.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });
  } catch (err) {
    console.error("Global error:", err);
    const errorMessage = errorHandler(err);
    // Return an error response with detailed information to the frontend
    return new Response(errorMessage, { status: 500 });
  }
}