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

const questionsByCategory = [
  {
    id: 'me',
    name: 'Me',
    icon: Sparkles,
    questions: [
      'Tell me about yourself',
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
      "What's your educational background?",
      'Can I see your resume?',
      'Where are you working now?',
      'What makes you a valuable team member?',
      'What makes your professional background unique?',
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: CodeIcon,
    questions: [
      'What projects are you most proud of?',
      "Show me something innovative you've built",
    ],
  },
  {
    id: 'skills',
    name: 'Skills',
    icon: GraduationCapIcon,
    questions: [
      'What programming languages do you know?',
      'How do you approach learning new technologies?',
    ],
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: PartyPopper,
    questions: [
      'Pain au chocolat or chocolatine?',
      'Mac or PC?',
      'What non-tech hobbies do you enjoy?',
      'If you could have dinner with any tech figure, who would it be?',
    ],
  },
  {
    id: 'contact',
    name: 'Contact & Availability',
    icon: MailIcon,
    questions: [
      'How can I reach you?',
      'What types of roles interest you most?',
      'Where are you located?',
    ],
  },
];

// Props for the Helper component
interface HelperProps {
  setInput?: (value: string) => void;
}

export default function Helper({ setInput }: HelperProps) {
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (question: string) => {
    if (setInput) {
      setInput(question);
    }
    setOpen(false);
  };
  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Drawer.Trigger className="relative flex h-10 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md px-3 text-sm font-medium transition-all hover:bg-[#ECECF0] dark:bg-[#161615] dark:text-white dark:hover:bg-[#1A1A19]">
              <ChevronUp size={20} />
            </Drawer.Trigger>
          </TooltipTrigger>
          <TooltipContent>
            <div className="bg-background/90 text-primary mb-2 flex items-center space-x-2 rounded-full border px-3 py-1.5 text-sm backdrop-blur-md">
              <Lightbulb className="mr-2 text-primary mx-auto h-4 w-4" />
              Need inspiration?
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Drawer.Portal>
        <Drawer.Overlay className="z-100 fixed inset-0 bg-black/60 backdrop-blur-xs" />{' '}
        <Drawer.Content className="z-100 fixed right-0 bottom-0 left-0 mt-24 flex h-[80%] flex-col rounded-t-[10px] bg-gray-100 outline-none lg:h-[60%]">
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
          />
        ))}
      </div>
    </div>
  );
}

// Component for each question item
interface QuestionItemProps {
  question: string;
  onClick: () => void;
}

function QuestionItem({ question, onClick }: QuestionItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-between rounded-[10px]',
        'text-md bg-[#F7F8F9] px-6 py-4 text-left font-normal',
        'transition-colors hover:bg-[#F0F0F2] focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500'
      )}
      onClick={onClick}
    >
      <span>{question}</span>
      <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-gray-400" />
    </button>
  );
}
