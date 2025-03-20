
import { tool } from "ai";
import { z } from "zod";

const projects = [
  {
    name: "AI-SDK",
    description: "A software development kit for building AI tools",
    url: ""
  },
  {
    name: "AI-Platform",
    description: "A platform for running AI tools",
    url: ""
  },
]


export const getProjects = tool({
  description:
    "This tool will return a list of all projects made by Raphael",
  parameters: z.object({}),
  execute: async () => {
    return projects;
  },
});