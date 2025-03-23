'use client';

import { useState } from 'react';
import { X, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Added a trigger prop to accept custom triggers
interface WelcomeModalProps {
  trigger?: React.ReactNode;
}

export default function WelcomeModal({ trigger }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default trigger is the logo
  const defaultTrigger = (
    <Button
      variant="ghost"
      className="hover:bg-accent h-auto w-auto cursor-pointer rounded-2xl p-4 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
      onClick={() => setIsOpen(true)}
    >
      <Image
        src="/logo-toukoum.svg"
        width={100}
        height={100}
        alt="Logo"
        className="w-6 md:w-8"
      />
      <span className="sr-only">About Toukoum</span>
    </Button>
  );

  return (
    <>
      {/* Use custom trigger if provided, otherwise use default */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-background max-h-[85vh] overflow-auto rounded-2xl border-none p-4 py-6 shadow-xl sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[1000px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            {/* Header */}
            <DialogHeader className="flex flex-row items-start justify-between px-8 pt-8 pb-6">
              <div>
                <DialogTitle className="flex items-center gap-2 text-4xl font-bold tracking-tight">
                  Welcome
                  <Sparkles className="text-primary h-6 w-6" />
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  {/*My interactive AI portfolio experience*/}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground bg-muted/80 h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>

            {/* Content area */}
            <div className="space-y-6 overflow-y-auto px-8 py-4">
              <section className="bg-accent w-full space-y-8 rounded-2xl p-8">
                {/* What section */}
                <div className="space-y-3">
                  <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                    What's ????
                  </h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    I'm so excited to present my brand new AI Portfolio.
                    <br /> Whether you're a recruiter, a friend, family member,
                    or just curious, feel free to ask anything you want!
                    <br /> You can inquire about my projects, professional
                    experience, skills, education, or even my personal interests
                    and background.
                  </p>
                </div>

                {/* Why section */}
                <div className="space-y-3">
                  <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                    Why ???
                  </h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    Traditional portfolios can be limiting – they can't adapt to
                    every visitor's specific needs. With this AI approach, my
                    portfolio becomes exactly what you're interested in knowing
                    about me and my work.
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center px-8 pt-4 pb-0 md:pb-8">
              <Button
                onClick={() => setIsOpen(false)}
                className="h-auto rounded-full px-4 py-3"
                size="sm"
              >
                Start Chatting
              </Button>
              <p className="text-muted-foreground mt-6 text-center text-sm">
                If you love it, please share it! Feedback is always welcome.
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
