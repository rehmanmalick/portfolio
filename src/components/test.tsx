// 'use client';

// import { useEffect, useRef, useState } from "react";

// type Msg = { id: string; role: "user" | "assistant"; content: string };

// export default function ChatTestSimple() {
//   const [messages, setMessages] = useState<Msg[]>([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const endRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!input.trim()) return;

//     const userMsg: Msg = { id: String(Date.now()) + "-u", role: "user", content: input };
//     setMessages((m) => [...m, userMsg]);
//     setInput("");
//     setIsLoading(true);
//     setError(null);

//     // ✅ Create placeholder for assistant message
//     const assistantId = String(Date.now()) + "-a";
//     setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           messages: [...messages, userMsg].map((x) => ({ 
//             role: x.role, 
//             content: x.content 
//           })) 
//         }),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || `Status ${res.status}`);
//       }

//       // ✅ Handle streaming response
//       const reader = res.body?.getReader();
//       const decoder = new TextDecoder();
//       let fullText = "";

//       if (reader) {
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           fullText += chunk;

//           // Update message in real-time
//           setMessages((m) => 
//             m.map((msg) => 
//               msg.id === assistantId 
//                 ? { ...msg, content: fullText } 
//                 : msg
//             )
//           );
//         }
//       }

//     } catch (err: any) {
//       console.error("Chat error:", err);
//       setError(err?.message ?? String(err));
      
//       // Remove failed assistant message
//       setMessages((m) => m.filter((msg) => msg.id !== assistantId));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen max-w-lg mx-auto p-4 bg-white shadow-lg">
//       <h1 className="text-2xl font-bold mb-4 text-gray-800">AI Chat Interface</h1>

//       <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50 flex flex-col gap-3">
//         {messages.length === 0 && <p className="text-gray-500 italic">Apna pehla sawal poochiye...</p>}

//         {messages.map((m) => (
//           <div
//             key={m.id}
//             className={`p-3 rounded-lg shadow-sm max-w-[80%] ${
//               m.role === "user" 
//                 ? "bg-blue-500 text-white self-end ml-auto" 
//                 : "bg-green-100 text-gray-800 self-start mr-auto"
//             }`}
//           >
//             <span className="font-semibold block mb-1">
//               {m.role === "user" ? "Aap:" : "AI:"}
//             </span>
//             <div className="whitespace-pre-wrap">
//               {m.content || "Typing..."}
//             </div>
//           </div>
//         ))}

//         {isLoading && <div className="mt-2 text-gray-500 italic">AI soch raha hai...</div>}

//         <div ref={endRef} />
//       </div>

//       <form onSubmit={send} className="flex gap-2">
//         <input
//           className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Koi sawal karain..."
//           disabled={isLoading}
//         />
//         <button 
//           type="submit" 
//           disabled={isLoading || !input.trim()} 
//           className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
//         >
//           {isLoading ? "..." : "Bhejo"}
//         </button>
//       </form>

//       {error && <p className="text-red-500 mt-2 text-sm">Error: {error}</p>}
//     </div>
//   );
// }