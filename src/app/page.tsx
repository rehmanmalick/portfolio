'use client';

import WelcomeModal from '@/components/welcome-modal';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

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

  // Simple variants for top elements (coming from top)
  const topElementVariants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'ease',
        duration: 0.8,
      },
    },
  };

  // Simple variants for bottom elements (coming from bottom)
  const bottomElementVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'ease',
        duration: 0.8,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 md:pb-20">
      {/* Giant background footer text */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex w-full justify-center overflow-hidden">
        <div
          className="pointer-events-none overflow-hidden bg-gradient-to-b from-neutral-500/10 from-10% to-neutral-500/0 bg-clip-text leading-none font-black text-transparent select-none sm:block hidden text-[10rem] sm:h-36 lg:h-52 lg:text-[16rem] dark:from-neutral-300/10 dark:to-neutral-300/0"
          style={{ marginBottom: '-2.5rem' }}
        >
          Toukoum
        </div>
      </div>

      {/* Top elements (coming from top) */}
      <motion.div
        className="z-10 mb-8 flex flex-col items-center justify-center text-center md:mb-12"
        variants={topElementVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo with Modal trigger - No need to add custom trigger */}
        <div className="relative cursor-pointer transition-transform">
          <WelcomeModal />
        </div>

        <h2 className="text-secondary-foreground text-xl font-semibold md:text-2xl dark:text-neutral-300">
          Hey, I'm Raphael 👋
        </h2>
        <h1 className="bg-background mt-3 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          World&apos;s First AI Portfolio
        </h1>
      </motion.div>

      {/* Center memoji (stable) */}
      <div className="relative z-10 h-64 w-64 overflow-hidden sm:h-72 sm:w-72">
        <Image
          src="/landing-memojis.png"
          width={2000}
          height={2000}
          alt="Hero"
          className="translate-y-14 scale-[2] object-cover"
          priority
        />
      </div>

      {/* Bottom elements (coming from bottom) */}
      <motion.div
        variants={bottomElementVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-lg md:px-0 mt-4"
      >
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-neutral-100 py-2.5 pr-2 pl-6 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Who are you?"
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