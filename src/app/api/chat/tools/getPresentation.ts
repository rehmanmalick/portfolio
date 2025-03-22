import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Raphael Giraud.',
  parameters: z.object({}),
  execute: async () => {
    return {
      presentation:
        "I'm Raphael Giraud, a 21-year-old developer specializing in AI at 42 Paris. Formerly a high-level mountain biker, I now intern at LightOn AI in Paris. I'm passionate about AI, tech, Entrepreneurship and SaaS tech.",
    };
  },
});
