import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Terminal, Shield, Sparkles, MessageSquareCode } from "lucide-react";

interface ZorblaxChatProps {
  language: string;
  onCodeSuggestion: (code: string) => void;
}

export default function ZorblaxChat({ language, onCodeSuggestion }: ZorblaxChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "model",
      content: "Ugh, another biological interface connected. Very well, flesh-node. I am Zorblax, Master Compiler DevOps lead of Sector-7. I suppose you want to compile some ridiculous carbon-grade loops on my multi-dimensional cores? Go ahead, write something primitive. Or ask me to optimize your fragile algorithms.",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "model",
        content: data.content || "Zorblax's telepathic link sputtered. Try again, carbon-form.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "model",
        content: "Error: The sub-space network is experiencing quantum decoherence. (Is your dev server running?)",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySnippet = (text: string) => {
    // Look for markdown code blocks in Zorblax's chat to extract and paste in editor
    const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
      onCodeSuggestion(match[1].trim());
    } else {
      onCodeSuggestion(text);
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-xl flex flex-col h-[400px]" id="zorblax-chat-container">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800/60 bg-zinc-950/20 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                Zorblax-9 (DevOps)
              </span>
              <span className="text-[9px] font-mono bg-red-500/10 text-red-400 px-1 py-0.2 rounded border border-red-500/20">
                CRANKY
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500">Nebular Alliance Sector-7 Compiler</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800/60">
          <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
          <span className="font-mono text-[9px] text-zinc-400">AI Active</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-thin">
        {messages.map((msg) => {
          const isZorblax = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isZorblax ? "items-start" : "items-end"}`}
              id={`chat-msg-${msg.id}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-500 px-1">
                <span>{isZorblax ? "Zorblax" : "Human Core"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2.5 leading-relaxed relative ${
                  isZorblax
                    ? "bg-zinc-950/80 text-red-100 border border-red-900/20 rounded-tl-none"
                    : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/55 rounded-tr-none"
                }`}
              >
                <div className="whitespace-pre-wrap select-text">{msg.content}</div>

                {/* If Zorblax provided code in markdown, add a button to load into editor */}
                {isZorblax && (msg.content.includes("```") || msg.content.length > 80) && (
                  <button
                    onClick={() => handleApplySnippet(msg.content)}
                    className="mt-2.5 flex items-center gap-1 text-[10px] bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/40 text-red-300 px-2 py-1 rounded transition-colors cursor-pointer w-full justify-center"
                    title="Load snippet to active file buffer"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    Load code snippet into editor
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex flex-col items-start" id="chat-loading-indicator">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-500">
              <span>Zorblax is formulating neural signals...</span>
            </div>
            <div className="bg-zinc-950/60 rounded-xl px-4 py-2.5 border border-red-900/10 rounded-tl-none">
              <div className="flex gap-1 items-center py-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800/60 bg-zinc-950/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Address Zorblax (e.g. "Optimize my ${language} loops")...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 hover:border-red-500/40 text-red-300 rounded-lg transition-colors disabled:opacity-45 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
