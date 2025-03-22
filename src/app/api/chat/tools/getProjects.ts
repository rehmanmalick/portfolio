
import { tool } from "ai";
import { z } from "zod";


export const getProjects = tool({
  description:
    "This tool will return a list of all projects made by Raphael",
  parameters: z.object({}),
  execute: async () => {
    return {
      projects: [
        {
          name: "Rrate",
          description: "A website to allow user to compare his salary with the richest people in the world",
        },
        {
          name: "Defai",
          description: "Win ETHOXford hackathon by buildingDEFAI stands for Decentralized Finance Artificial Intelligence—an AI-powered chat interface that simplifies on-chain operations on Avalanche.",
        },
        {
          name: "Fitgear",
          description: "Win Gotta Go Hack IA by building Fitgear, a virtual voice seller accessible by QR code to improve the ratio between customers and sellers. Creation of an AI pipeline with API calls and a RAG",
        },
        {
          name: "Datai.com",
          description: "DATAI is an AI-powered agent that lets non-technical users query a database using natural language without writing SQL. Built using Next.js, TailwindCSS, shadcn-ui, and Anthropic’s Claude API, this project focuses on simplicity, speed, and user-friendly design. Just ask a question like “Who were my top customers last month?” and DATAI will generate and execute the SQL query behind the scenes, returning accurate, clear results in real time.",
        },
        {
          name: "Transcendance",
          description: "Transcendance is the last Project of my 42 cursus. It's a 3D pong game",
        },
        {
          name: "Raphaël Giraud Portfolio",
          description: "My old traditional portfolio build with vanilla HTML, CSS and JS (and a bit of GSAP)",
        },
        {
          name: "Minishell",
          description: "Minishell is a project that aims to create a simple shell. It's a great introduction to process creation and management in C.",
        },
        {
          name: "YouBot",
          description: "YouBot is a Python Bot that Scrape Videos from Pexels, & Add a Random Song from Songs Folder, Then You Can Auto Upload The Videos To Your Youtube Channel",
        }
      ],
    };
  },
});