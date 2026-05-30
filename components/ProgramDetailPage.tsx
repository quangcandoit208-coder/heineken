
import React from 'react';
import { ArrowLeft, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Promotion, View } from '../types';

interface ProgramDetailPageProps {
  program?: Promotion;
  onBack: () => void;
  setCurrentView: (view: View) => void;
  onViewScheduleWithBrand?: (brand: string) => void;
  language: 'vi' | 'en';
}

const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({ program, onBack, setCurrentView, onViewScheduleWithBrand, language }) => {
  if (!program) return <div className="p-20 text-center">No program found.</div>;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const handleCta = () => {
      if (program.type === 'Activation') {
          onViewScheduleWithBrand ? onViewScheduleWithBrand(program.brand) : setCurrentView('activation');
      } else if (program.venueListLink) {
          window.open(program.venueListLink, '_blank');
      }
  };

  const t = {
    back: language === 'vi' ? 'Quay lại' : 'Back',
    ctaActivation: language === 'vi' ? 'Tra cứu lịch trình ngay' : 'Check schedule now',
    ctaAwo: language === 'vi' ? 'Xem danh sách quán áp dụng' : 'View participating venues',
    offerMsg: language === 'vi' ? 'Bạn muốn nhận ưu đãi từ chương trình?' : 'Want to get offers from this program?'
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[45vh] md:h-[60vh] bg-gray-900">
        <picture className="w-full h-full">
            <source media="(max-width: 768px)" srcSet={program.mobileImage || program.image} />
            <img src={program.image} alt={program.title} className="w-full h-full object-cover opacity-80" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        <button onClick={onBack} className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 flex items-center gap-2 transition-all">
            <ArrowLeft className="w-5 h-5" /> {t.back}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-50">
            <div className="flex gap-2 mb-6">
                <span className="px-4 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full uppercase">{program.brand}</span>
                <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full uppercase">{program.type}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">{program.title}</h1>
            
            <div className="flex gap-8 mb-10 text-gray-500 text-sm font-medium">
                <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-green-700" /> {formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                <span className="flex items-center gap-2"><Tag className="w-5 h-5 text-green-700" /> {program.regions.join(', ')}</span>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {program.content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
            </div>

            <div className="mt-16 pt-10 border-t flex flex-col items-center">
                <p className="text-gray-500 mb-6 font-medium">{t.offerMsg}</p>
                <button onClick={handleCta} className="px-10 py-4 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-xl flex items-center gap-2">
                    {program.type === 'Activation' ? t.ctaActivation : t.ctaAwo}
                    <ExternalLink className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
