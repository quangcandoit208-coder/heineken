
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Info } from 'lucide-react';
import { AppSettings, View } from '../types';

interface HomePageProps {
  setCurrentView: (view: View) => void;
  settings: AppSettings;
  onSelectProgram?: (id: string) => void;
  onViewScheduleWithBrand?: (brand: string) => void;
  language: 'vi' | 'en';
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentView, settings, onSelectProgram, onViewScheduleWithBrand, language }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const promotions = settings.promotions || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [promotions.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const handlePromoClick = (id: string) => {
    if (onSelectProgram) {
      onSelectProgram(id);
      return;
    }
    setCurrentView('program-list');
  };

  const handleScheduleClick = (brand: string) => {
      if (onViewScheduleWithBrand) {
          onViewScheduleWithBrand(brand);
      } else {
          setCurrentView('activation');
      }
  };

  const t = {
    details: language === 'vi' ? 'Chi tiết' : 'Details',
    schedule: language === 'vi' ? 'Lịch trình' : 'Schedule',
    discover: language === 'vi' ? 'Khám phá Lịch Hoạt Động đang diễn ra tại TONT' : 'Discover ongoing Activation activities at TONT',
    summary: language === 'vi' ? 'Tổng hợp Chương trình' : 'Program Summary',
    viewNow: language === 'vi' ? 'Xem lịch Activation ngay' : 'View Activation Schedule',
    viewAwoNow: language === 'vi' ? 'Xem lịch AWO ngay' : 'View AWO Schedule',
    noInfo: language === 'vi' ? 'Chưa có thông tin chương trình.' : 'No program information available.'
  };

  if (promotions.length === 0) return <div className="p-20 text-center">{t.noInfo}</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="relative w-full h-[75vh] bg-gray-900 overflow-hidden group">
        {promotions.map((promo, index) => (
          <div key={promo.id} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <picture className="w-full h-full">
                <source media="(max-width: 768px)" srcSet={promo.mobileImage || promo.image} />
                <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            
            <div className="absolute bottom-16 left-0 w-full px-6 max-w-7xl mx-auto">
                <span className="inline-block px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full mb-4 uppercase">{promo.brand}</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">{promo.title}</h2>
                <div className="flex gap-4">
                    <button 
                      onClick={() => handlePromoClick(promo.id)} 
                      className="px-6 py-3 bg-white text-gray-900 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                      <Info className="w-5 h-5" /> {t.details}
                    </button>
                    <button 
                      onClick={() => handleScheduleClick(promo.brand)} 
                      className="px-6 py-3 bg-green-700 text-white font-bold rounded-full shadow-lg hover:bg-green-800 transition-all flex items-center gap-2"
                    >
                      <Calendar className="w-5 h-5" /> {t.schedule}
                    </button>
                </div>
            </div>
          </div>
        ))}

        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {promotions.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                />
            ))}
        </div>
      </div>

      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight">
            {t.discover}
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setCurrentView('program-list')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-green-700 border-2 border-green-700 font-bold rounded-full hover:bg-green-50 transition-all shadow-lg transform hover:-translate-y-1"
            >
              {t.summary}
            </button>
            <button 
              onClick={() => setCurrentView('activation')}
              className="w-full sm:w-auto px-8 py-4 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {t.viewNow}
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentView('awo-schedule')}
              className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 border-2 border-green-600"
            >
              {t.viewAwoNow}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
