
import { tool } from "ai";
import { z } from "zod";


export const getProjects = tool({
  description:
    "This tool will return a list of all projects made by Raphael",
  parameters: z.object({}),
  execute: async () => {
    return {};
  },
});