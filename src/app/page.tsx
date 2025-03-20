

import { Input } from "@/components/ui/input-landing";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-8">
      <div className="flex flex-col items-center justify-center space-y-8">
        <h2>Meet  Toukoum</h2>
        <h1 className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
          World&apos;s first AI Portfolio
        </h1>
      </div>

      <div className="w-96 h-96 relative">
        <Image 
          src="/avatar-landing.png"
          width={600}
          height={600}
          alt="Hero"
        />
      </div>
      <div>
      <Input type="text" placeholder="Ask me anything" />

      </div>



    </div>
  );
}
