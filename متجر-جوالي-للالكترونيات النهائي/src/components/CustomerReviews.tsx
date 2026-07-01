import React from 'react';
import { Star, ShieldCheck, Heart } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
  productBought: string;
}

export const CustomerReviews: React.FC = () => {
  const reviews: Review[] = [
    {
      id: 1,
      name: 'المهندس أحمد الهواري',
      location: 'التجمع الخامس، القاهرة',
      rating: 5,
      date: 'منذ يومين',
      comment: 'ما شاء الله تبارك الله، تجربة شراء ممتازة جداً! اشتريت آيفون 15 برو ماكس تيتانيوم وجالي مغلق بكرتونته الأصلية ومعاه الضمان الرسمي. التوصيل جالي في أقل من ٢٤ ساعة لحد باب الشقة، والمعاملة قمة في الرقي والأمانة. والدفع كاش بعد ما عاينت الجهاز بنفسي. أنصح الجميع بالتعامل مع متجر جوالي.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      productBought: 'آيفون 15 برو ماكس (256 جيجابايت)',
    },
    {
      id: 2,
      name: 'الأستاذة سارة الشربيني',
      location: 'سموحة، الإسكندرية',
      rating: 5,
      date: 'منذ ٤ أيام',
      comment: 'خدمة العملاء سريعة جداً وردوا عليا علطول بخصوص سماعة الآيربودز برو. السماعة أصلية ١٠٠٪ وصوتها تحفة وعزل الضوضاء فيها جبار. عجبني جداً إن الشحن مجاني والتوصيل سريع جداً، ومندوب الشحن كان في منتهى الذوق وخلاني أجرب السماعة وأتأكد من سيريال نمبر الجهاز على موقع آبل قبل ما أدفع. شكراً جوالي ستور!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
      productBought: 'آبل آيربودز برو (الجيل الثاني)',
    },
    {
      id: 3,
      name: 'الدكتور محمود عبد العزيز',
      location: 'المنصورة، الدقهلية',
      rating: 5,
      date: 'منذ أسبوع',
      comment: 'اشتريت هاتف سامسونج S24 ألترا، بصراحة كنت قلقان من الشراء أونلاين بمبلغ كبير كدة، لكن مصداقية المتجر والدفع عند الاستلام طمنوني جداً. المندوب جالي ومراجعته للجهاز معايا خلتني مطمن. الجهاز رائع بذكائه الاصطناعي ومعاه هدايا ممتازة جراب حماية وشاحن سريع أصلي. تعامل محترم جداً.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
      productBought: 'سامسونج جالكسي S24 ألترا (512 جيجابايت)',
    },
  ];

  return (
    <div className="space-y-6 text-right" id="gawali-customer-reviews">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
          <span>آراء ومراجعات عملائنا الموثوقين ⭐⭐⭐⭐⭐</span>
        </h3>
        <p className="text-xs text-slate-400 font-bold">تجارب حقيقية لعملاء تعاملوا معنا وسعدنا بـ خدمتهم في جميع أنحاء جمهورية مصر العربية.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white border border-brand-dark/15 hover:border-brand-blue/30 p-6 rounded-xl space-y-4 transition-all duration-300 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Profile header */}
              <div className="flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border border-brand-dark/10 group-hover:scale-105 duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-brand-dark flex items-center gap-1">
                    <span>{rev.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                  </h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>{rev.location}</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-5 group-hover:text-slate-700 transition-colors">
                "{rev.comment}"
              </p>
            </div>

            {/* Product bought tag */}
            <div className="pt-3 border-t border-brand-dark/10 flex items-center justify-between text-[10px] font-black text-brand-blue bg-brand-sand/30 -mx-6 -mb-6 p-4 rounded-b-xl mt-4">
              <span>المنتج المشترى:</span>
              <span className="bg-white py-1 px-2.5 rounded-md border border-brand-dark/10 truncate max-w-[180px] text-brand-dark font-bold">
                {rev.productBought}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
