import { tool } from 'ai';
import { z } from 'zod';

export const getResume = tool({
  description:
    'This tool returns a my resume.',
  parameters: z.object({}),
  execute: async () => {
    return {
      resume: "Here is my resume above, you can download it",
    };
  },
});
