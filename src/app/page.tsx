'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Encode the input for URL safety
    const encodedQuery = encodeURIComponent(input.trim());

    // Navigate to chat page with the query parameter
    router.push(`/chat?query=${encodedQuery}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && input.trim()) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 md:py-16">
      <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-12">
        <Image
          src="/logo-toukoum.svg"
          width={100}
          height={100}
          alt="Logo"
          className="mb-4 w-8 md:w-10"
        />
        <h2 className="text-secondary-foreground text-xl font-semibold md:text-2xl dark:text-neutral-300">
          Meet Toukoum
        </h2>
        <h1 className="bg-background mt-3 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          World&apos;s First AI Portfolio
        </h1>
      </div>

      <div className="relative mb-10 h-64 w-64 overflow-hidden sm:h-72 sm:w-72">
        <Image
          src="/landing-memojis.png"
          width={2000}
          height={2000}
          alt="Hero"
          className="translate-y-14 scale-[2] object-cover"
          priority
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md md:px-0"
      >
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-neutral-100 py-3 pr-2 pl-6 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything"
              className="w-full border-none bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:border-neutral-300 focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-500"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              aria-label="Submit question"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
