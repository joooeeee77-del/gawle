import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Phone, ArrowUpRight, Minus } from "lucide-react";
import { useStore } from "../context/StoreContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export const ChatBot: React.FC = () => {
  const { products } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "أهلاً بك في متجر جوالي! أنا مساعدك الذكي ⚡📱\n\nكيف يمكنني مساعدتك اليوم في اختيار الموبايلات والإكسسوارات والشواحن المتاحة؟",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = `https://wa.me/201000117260?text=${encodeURIComponent("مرحبا جوالي لدي بعض الاستفسارات")}`;

  const suggestions = [
    "عرض أحدث الموبايلات المتاحة",
    "أسعار الشواحن الأصلية وكابلات الشحن",
    "هل متوفر أغطية حماية MagSafe؟",
    "ما هي طرق الدفع والشحن في المحافظات؟",
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const userMessageText = textToSend || input.trim();
    if (!userMessageText || isLoading) return;

    if (!textToSend) {
      setInput("");
    }

    const userMessage: Message = {
      sender: "user",
      text: userMessageText,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          userMessage: userMessageText,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        sender: "bot",
        text: data.response || "عذراً، لم أستطع معالجة الرد حالياً. يمكنك تكرار سؤالك.",
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const botErrorMessage: Message = {
        sender: "bot",
        text: "حدث خطأ بالاتصال. لتسهيل خدمتك، يرجى التحدث معنا عبر الواتساب مباشرة على الرقم 01000117260.",
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans" dir="rtl" id="chatbot-assistant-widget">
      
      {/* 1. Collapsible Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl w-[92vw] sm:w-[380px] h-[520px] max-h-[75vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden fixed bottom-24 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="bg-white/10 p-2 rounded-xl text-lg leading-none">
                  📱
                </div>
                <span className="absolute bottom-0 left-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div className="text-right">
                <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none flex items-center gap-1.5">
                  <span>مساعد جوالي الذكي</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                </h3>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">نشط ومستعد لمساعدتك الآن</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
              title="تصغير المحادثة"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "mr-auto text-left" : "ml-auto text-right"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap font-semibold shadow-3xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tl-none self-end"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tr-none self-start"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-slate-400 font-bold mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col ml-auto max-w-[80%] text-right">
                <div className="bg-white border text-slate-400 p-2.5 rounded-2xl rounded-tr-none text-[10px] flex items-center gap-2 self-start shadow-3xs font-semibold">
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span>يكتب لك الآن...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions scrollable */}
          <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5" dir="rtl">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sug)}
                  disabled={isLoading}
                  className="text-[9px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100/70 border border-blue-100/50 rounded-lg py-1 px-2.5 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Direct */}
          <div className="bg-emerald-500 p-2.5 px-3 flex items-center justify-between text-white border-t border-emerald-400/20 shrink-0">
            <span className="text-[9px] font-black leading-none">تواصل مع الدعم الفني لمتجر جوالي 📱</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[9px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition shadow-3xs cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 fill-emerald-700 stroke-none" />
              <span>دعم واتساب</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {/* Form input */}
          <form onSubmit={handleFormSubmit} className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل مساعدنا هنا فوراً..."
              className="flex-grow bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:bg-white rounded-xl py-2 px-3 text-xs text-right font-medium"
              dir="rtl"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center text-xs"
              title="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

        </div>
      )}

      {/* 2. Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-blue-200/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group/fab relative select-none"
        title="مساعد الدعم الذكي (اضغط لبدء المحادثة)"
        id="chatbot-fab"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        
        {isOpen ? (
          <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 group-hover/fab:rotate-6 transition-transform duration-300" />
            <span className="max-w-0 overflow-hidden group-hover/fab:max-w-xs transition-all duration-300 ease-out whitespace-nowrap font-bold text-xs pr-0 group-hover/fab:pr-2.5">
              اسأل مساعدنا الذكي ⚡
            </span>
          </>
        )}
      </button>
      
    </div>
  );
};
