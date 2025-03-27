'use client';

import {
  BriefcaseIcon,
  ChevronRight,
  ChevronUp,
  CodeIcon,
  GraduationCapIcon,
  Lightbulb,
  MailIcon,
  PartyPopper,
  Sparkles,
  Star,
  UserSearch,
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { useState } from 'react';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';

// List of special questions that need special design
const specialQuestions = [
  'Mountain Bike you said?? Show me!',
  'Who are you?',
  'Can I see your resume?',
  'What projects are you most proud of?',
  'What are your skills?',
  'How can I reach you?',
  'What\'s the craziest thing you\'ve ever done?',
];

const questionsByCategory = [
  {
    id: 'me',
    name: 'Me',
    icon: UserSearch,
    questions: [
      'Who are you?',
      'What are your passions?',
      'How did you get started in tech?',
      'Where do you see yourself in 5 years?',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    questions: [
      'Can I see your resume?',
      'What makes you a valuable team member?',
      'Where are you working now?',
      'Why should I hire you?',
      "What's your educational background?",
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: CodeIcon,
    questions: [
      'What projects are you most proud of?',
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: GraduationCapIcon,
    questions: [
      'What are your skills?',
      'How was your experience at École 42?',
    ], 
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: PartyPopper,
    questions: [
      'Mountain Bike you said?? Show me!',
      'What\'s the craziest thing you\'ve ever done?',
      'Mac or PC?',
      'What are you certain about that 90% get wrong?',
    ],
  },
  {
    id: 'contact',
    name: 'Contact & Future',
    icon: MailIcon,
    questions: [
      'How can I reach you?',
      "What kind of project would make you say 'yes' immediately?",
      'Where are you located?',
    ],
  },
];

// Animated Chevron component
const AnimatedChevron = () => {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0], // Subtle up and down motion
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      }}
      className="text-primary mb-1.5"
    >
      <ChevronUp size={16} />
    </motion.div>
  );
};

// Updated Props for the Helper component
interface HelperProps {
  setInput?: (value: string) => void;
  submitQuery?: (query: string) => void; // Added submitQuery function
}

export default function Helper({ setInput, submitQuery }: HelperProps) {
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (question: string) => {
    // If submitQuery is available, directly send the question
    if (submitQuery) {
      submitQuery(question);
    }
    // Close the drawer
    setOpen(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Drawer.Trigger className="group relative flex items-center justify-center">
              <motion.div
                className="hover:border-neutral-300 flex cursor-pointer items-center space-x-1 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900"
                whileHover={{ scale: 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Lightbulb className="mr-1.5 h-4 w-4" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Need inspiration?
                </span>
              </motion.div>
            </Drawer.Trigger>
          </TooltipTrigger>
          <TooltipContent>
            <AnimatedChevron />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-100 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-[60%]">
          <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
            <div className="mx-auto max-w-md space-y-4">
              <div
                aria-hidden
                className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300"
              />
              <div className="mx-auto w-full max-w-md">
                <div className="space-y-8 pb-16">
                  {questionsByCategory.map((category) => (
                    <CategorySection
                      key={category.id}
                      name={category.name}
                      Icon={category.icon}
                      questions={category.questions}
                      onQuestionClick={handleQuestionClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Component for each category section
interface CategorySectionProps {
  name: string;
  Icon: React.ElementType;
  questions: string[];
  onQuestionClick: (question: string) => void;
}

function CategorySection({
  name,
  Icon,
  questions,
  onQuestionClick,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <Icon className="h-5 w-5" />
        <Drawer.Title className="text-[22px] font-medium text-gray-900">
          {name}
        </Drawer.Title>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {questions.map((question, index) => (
          <QuestionItem
            key={index}
            question={question}
            onClick={() => onQuestionClick(question)}
            isSpecial={specialQuestions.includes(question)}
          />
        ))}
      </div>
    </div>
  );
}

// Component for each question item with animated chevron
interface QuestionItemProps {
  question: string;
  onClick: () => void;
  isSpecial: boolean;
}

function QuestionItem({ question, onClick, isSpecial }: QuestionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        'flex w-full items-center justify-between rounded-[10px]',
        'text-md px-6 py-4 text-left font-normal',
        'transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isSpecial 
          ? 'bg-black' 
          : 'bg-[#F7F8F9]'
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        backgroundColor: isSpecial ? undefined : '#F0F0F2',
      }}
      whileTap={{ 
        scale: 0.98,
        backgroundColor: isSpecial ? undefined : '#E8E8EA'
      }}
    >
      <div className="flex items-center">
        {isSpecial && <Sparkles className="text-white h-4 w-4 mr-2" />}
        <span className={isSpecial ? 'font-medium text-white' : ''}>
          {question}
        </span>
      </div>
      <motion.div
        animate={{ x: isHovered ? 4 : 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <ChevronRight className={cn(
          "h-5 w-5 shrink-0", 
          isSpecial ? "text-white" : "text-primary"
        )} />
      </motion.div>
    </motion.button>
  );
}