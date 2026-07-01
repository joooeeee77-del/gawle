import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowRight, MessageCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface ChatPageProps {
  onBackToStore: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onBackToStore }) => {
  const { products } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "أهلاً بك في متجر جوالي! أنا مساعدك الذكي ⚡📱\n\nكيف يمكنني مساعدتك اليوم في تصفح الموبايلات الجديدة أو المستعملة، أو اختيار الإكسسوارات والشواحن؟",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Prefilled WhatsApp message requested by the user
  const whatsappUrl = `https://wa.me/201000117260?text=${encodeURIComponent("مرحبا جوالي لدي بعض الاستفسارات")}`;

  // Quick suggestions for the user
  const suggestions = [
    "عرض أحدث الموبايلات المتاحة",
    "أسعار الشواحن الأصلية وكابلات الشحن",
    "هل متوفر أغطية حماية MagSafe؟",
    "ما هي طرق الدفع والشحن في المحافظات؟",
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden h-[calc(100vh-140px)] min-h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200" dir="rtl" id="chat-page-view">
      
      {/* Header of Dedicated Chat */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl cursor-pointer transition-colors active:scale-95"
            title="العودة للمتجر"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="bg-white/20 p-2.5 rounded-2xl text-2xl leading-none">
              📱
            </div>
            <span className="absolute bottom-0 left-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-blue-600" />
          </div>
          
          <div className="text-right">
            <h2 className="text-sm sm:text-base font-black tracking-tight leading-none flex items-center gap-1.5">
              <span>مساعد جوالي الذكي</span>
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            </h2>
            <p className="text-[10px] sm:text-xs text-blue-100 font-bold mt-1.5">مساعدك الفوري للإجابة على كافة أسئلتك بالذكاء الاصطناعي</p>
          </div>
        </div>

        <button
          onClick={onBackToStore}
          className="hidden sm:flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs py-2 px-4 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
        >
          العودة للمتجر
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "mr-auto text-left" : "ml-auto text-right"
            }`}
          >
            <div
              className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-2xs ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tl-none self-end"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tr-none self-start"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-400 font-bold mt-1.5 px-1">{msg.time}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col ml-auto max-w-[80%] text-right">
            <div className="bg-white border text-slate-500 p-3.5 rounded-2xl rounded-tr-none text-xs flex items-center gap-2 self-start shadow-3xs font-semibold">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>مساعد جوالي يكتب لك الآن...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions box for quick interaction */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <p className="text-[10px] text-slate-400 font-black mb-2 text-right">أسئلة مقترحة للاستفسار السريع:</p>
        <div className="flex flex-wrap gap-2 justify-start overflow-x-auto no-scrollbar py-0.5" dir="rtl">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug)}
              disabled={isLoading}
              className="text-[11px] font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/70 border border-blue-100/50 rounded-xl py-1.5 px-3 whitespace-nowrap transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Support Direct Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 px-4 flex items-center justify-between text-white border-t border-emerald-400/20 shadow-xs shrink-0">
        <div className="text-right space-y-1">
          <h5 className="text-[11px] sm:text-xs font-black leading-none">مبيعات ودعم متجر جوالي الرسمي</h5>
          <p className="text-[9px] sm:text-[10px] text-emerald-50 font-bold">تواصل مباشر لطلب فوري وتتبع الشحنات</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-[10px] sm:text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-emerald-700 stroke-none" />
          <span>مراسلتنا عبر واتساب</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* User Input Form */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب استفسارك هنا ومساعدنا يجيبك فوراً..."
          className="flex-grow bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:bg-white rounded-xl py-3 px-4 text-xs sm:text-sm text-right font-medium"
          dir="rtl"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-3 rounded-xl transition duration-200 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-xs sm:text-sm"
          title="إرسال"
        >
          <Send className="w-5 h-5 rotate-180" />
        </button>
      </form>

    </div>
  );
};
