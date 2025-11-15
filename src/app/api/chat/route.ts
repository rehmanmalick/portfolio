// src/app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getInternship } from './tools/getIntership';
import { getResume } from './tools/getResume';
import { getSkills } from './tools/getSkills';

function errorHandler(error: unknown): string {
  if (error == null) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('[CHAT-API] Incoming messages:', messages);

    messages.unshift(SYSTEM_PROMPT);

    const tools = {
      getResume,
      getContact,
      getSkills,
      getInternship,
    };

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('❌ Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return new Response('API key not configured', { status: 500 });
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages,
      tools,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('❌ Global error:', err);
    return new Response(errorHandler(err), { status: 500 });
  }
}
