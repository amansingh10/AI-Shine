"use client";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Header from "../../../components/Header";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Hello! I’m **AI Shine**, your smart assistant. Ask me anything or start a new conversation!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [listening, setListening] = useState(false);
const recognitionRef = useRef(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-IN";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
        setListening(false);
      };

      recognitionRef.current.onend = () => setListening(false);
    }
  }
}, []);

const toggleListening = () => {
  if (!recognitionRef.current) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  if (listening) {
    recognitionRef.current.stop();
    setListening(false);
  } else {
    recognitionRef.current.start();
    setListening(true);
  }
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { role: "human", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    await sendToAI(newMessages);
  }

async function sendToAI(newMessages) {
  setLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: newMessages[newMessages.length - 1].content,
      }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "ai", content: data.answer || "🤖 I’m here to help!" },
    ]);
  } catch (error) {
    console.error("Error:", error);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content:
          "⚠️ Oops! I couldn’t connect to the server. Please try again later.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}


  function handleTextareaChange(e) {
    setInput(e.target.value);
    const maxHeight = 200;
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
    e.target.style.overflowY =
      e.target.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: "ai",
        content: "✨ Hi again! I’m **AI Shine** — ready for a fresh chat!",
      },
    ]);
    setInput("");
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-gray-100 text-white overflow-hidden">
      {/* --- Header --- */}
      <div className="z-20 bg-gradient-to-r from-[#071C39] via-[#0B3266] to-[#134F95] text-white shadow-md flex-shrink-0">
        <Header onClearChat={handleClearChat} />
      </div>

      {/* --- Chat Section --- */}
      <div className="flex-grow overflow-y-auto px-5 py-6 space-y-5 scrollbar-hide">
         {/* --- Date Divider --- */}
  <div className="flex justify-center my-2">
    <div className="bg-white/60 text-gray-700 text-xs font-semibold px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
      {new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}
    </div>
  </div>
       {messages.map((msg, idx) => {
  const isUser = msg.role === "human";
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });


  


  return (
    <div
      key={idx}
      className={`flex flex-col ${
        isUser ? "items-end" : "items-start"
      } space-y-1`}
    >
      {/* --- Name + Icon Row --- */}
      <div
        className={`flex items-center gap-2 mb-1 ${
          isUser ? "flex-row-reverse pr-2" : "flex-row pl-2"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
            isUser
              ? "bg-gradient-to-r from-gray-600 to-gray-400"
              : "bg-gradient-to-r from-blue-600 to-green-400"
          }`}
        >
          <span className="text-white text-sm">
            {isUser ? "👤" : "🤖"}
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            isUser ? "text-gray-700" : "text-blue-600"
          }`}
        >
          {isUser ? "You" : "AI Shine"}
        </span>
      </div>

      {/* --- Message Bubble --- */}
      {/* --- Message Bubble --- */}
<div
  className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm md:text-base shadow-lg transition-all duration-300 ${
    isUser
      ? "bg-[#334155]/70 text-white rounded-br-none backdrop-blur-md"
      : "bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 rounded-bl-none shadow-sm border border-blue-300/40"
  }`}
>
  <ReactMarkdown>{msg.content}</ReactMarkdown>
  <div
    className={`text-[10px] mt-1 ${
      isUser ? "text-right text-gray-300" : "text-left text-gray-500"
    } opacity-80`}
  >
    {time}
  </div>
</div>

    </div>
  );
})}



        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-md flex items-center gap-3">
              <svg
                className="w-5 h-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>🤔 AI Shine is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Input Area --- */}
     {/* --- Input Area --- */}
<div className="bg-[#b5d2f8] border-t border-gray-300 p-4 flex gap-3 items-end flex-shrink-0">
  <textarea
    className="flex-grow bg-white text-gray-800 placeholder:text-gray-500 px-4 py-3 rounded-2xl resize-none min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#0B3266] transition-all duration-200"
    placeholder="Type your message or use mic..."
    rows="1"
    value={input}
    onChange={handleTextareaChange}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
  />

  {/* 🎤 Mic Button */}
  <button
    className={`rounded-full p-3 flex-shrink-0 shadow-md transition-transform ${
      listening
        ? "bg-gradient-to-r from-red-500 to-pink-500 scale-110"
        : "bg-gradient-to-r from-gray-400 to-gray-600 hover:scale-105"
    }`}
    onClick={toggleListening}
    title={listening ? "Listening..." : "Tap to Speak"}
  >
    <Image
      src="/icons/mic.svg"
      width={22}
      height={22}
      alt="mic"
      className="invert"
    />
  </button>

  {/* 🚀 Send Button */}
  <button
    className="bg-gradient-to-r from-[#0B3266] to-[#134F95] rounded-full p-3 flex-shrink-0 shadow-md hover:scale-105 transition-transform"
    onClick={sendMessage}
  >
    <Image
      src="/icons/submit.svg"
      width={22}
      height={22}
      alt="send"
      className="invert-0"
    />
  </button>
</div>

    </main>
  );
}
