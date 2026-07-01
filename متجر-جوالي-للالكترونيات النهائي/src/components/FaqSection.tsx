import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'هل جميع المنتجات والأجهزة في متجر جوالي أصلية ومضمونة؟',
      answer: 'نعم بكل تأكيد! نحن نضمن لك بنسبة ١٠٠٪ أن جميع الهواتف المحمولة والإلكترونيات والسماعات والشواحن المعروضة بمتجرنا أصلية تماماً وخاضعة للرقابة والجودة. الأجهزة الجديدة تأتي مغلفة بعلبها المصنعية الأصلية وبضمان الوكيل الرسمي المعتمد في جمهورية مصر العربية، والأجهزة المستعملة (كسر زيرو) مفرزة ومفحوصة بدقة فائقة من فريقنا التقني لضمان خلوها تماماً من العيوب وتأتي مع ضمان خاص من متجر جوالي.',
    },
    {
      id: 2,
      question: 'كيف يمكنني تتبع حالة ومسار طلبي بعد إتمامه؟',
      answer: 'لقد وفرنا لك ميزة تتبع ذكية وفائقة السرعة! بمجرد إتمام طلبك بنجاح، ستحصل على كود تتبع فريد خاص بطلبك. يمكنك بكل بساطة الضغط على زر "تتبع طلبك" في أعلى الصفحة (الهيدر) وإدخال كود التتبع أو رقم هاتفك لتظهر لك حالة الطلب وتفاصيل مساره لحظة بلحظة بدءاً من الفحص مروراً بالخروج للشحن وحتى وصول المندوب لباب بيتك.',
    },
    {
      id: 3,
      question: 'ما هي وسائل وطرق الدفع المتاحة بالمتجر؟',
      answer: 'نوفر لك خيار الدفع الأكثر أماناً وراحة وهو "الدفع نقداً عند الاستلام (COD)"، حيث يمكنك مراجعة طلبك وتجربته بنفسك أمام مندوب الشحن قبل دفع أي مبالغ مالية. كما ندعم التحويلات المالية عبر المحافظ الإلكترونية المختلفة مثل فودافون كاش، اتصالات كاش، أورنج كاش ومحافظ البنوك الرقمية لتسهيل الدفع السريع والآمن.',
    },
    {
      id: 4,
      question: 'هل يتوفر لديكم سياسة للاسترجاع أو الاستبدال؟',
      answer: 'نعم، نحن نضع رضا وثقة عملائنا في المقام الأول! نوفر سياسة استبدال واسترجاع مرنة خلال ١٤ يوماً من تاريخ الاستلام في حال وجود أي عيب مصنعي أو عدم مطابقة للمواصفات المعلنة، شريطة أن يكون المنتج بحالته الأصلية ومرفقاً بكافة ملحقاته وعلبته الأصلية دون أي تلف أو سوء استخدام.',
    },
  ];

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-6 text-right" id="gawali-faq-section">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
          <span>الأسئلة الشائعة والاستفسارات 💬</span>
        </h3>
        <p className="text-xs text-slate-400 font-bold">كل ما تود معرفته عن الضمان، التوصيل السريع، وسياسات الدفع والاستبدال في متجر جوالي.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white border border-brand-dark/15 rounded-xl overflow-hidden transition-all duration-300 shadow-xs"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-right font-black text-brand-dark hover:bg-brand-sand/30 transition-colors cursor-pointer text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-brand-blue shrink-0" />
                  <span>{faq.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-blue shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1.5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-brand-dark/10 bg-brand-sand/10 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
