
import React, { useState } from 'react';
import { View, AppSettings } from '../types';
import { ChevronDown, Languages, Menu, X, Plus, Minus, Home, Calendar, Layers, MapPin } from 'lucide-react';

interface NavbarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  settings: AppSettings;
  onSelectProgram?: (programId: string) => void;
  language: 'vi' | 'en';
  toggleLanguage: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, settings, onSelectProgram, language, toggleLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgramsExpanded, setIsProgramsExpanded] = useState(false);
  
  const handleProgramClick = (id: string) => {
    if (onSelectProgram) {
      onSelectProgram(id);
      setIsMobileMenuOpen(false);
    }
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const activationPrograms = settings.promotions.filter(p => p.type === 'Activation');
  const awoPrograms = settings.promotions.filter(p => p.type === 'AWO');

  const t = {
    home: language === 'vi' ? 'Trang chủ' : 'Home',
    programs: language === 'vi' ? 'Thông tin chương trình' : 'Programs',
    schedule: language === 'vi' ? 'Lịch Activation' : 'Activation Schedule',
    awo: language === 'vi' ? 'Lịch AWO' : 'AWO Schedule',
    allPrograms: language === 'vi' ? 'Xem tất cả chương trình' : 'View all programs'
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <img 
              src={settings.logoUrl} 
              alt="Heineken Vietnam" 
              className="h-10 md:h-12 w-auto object-contain"
            />
            <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-1">
  <span className="text-green-700">HVN</span>
  <span className="text-gray-900">TONT</span>
  <span className="text-gray-900 hidden sm:inline-block">CALENDAR</span>
</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={() => navigateTo('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'home' ? 'text-green-700' : 'text-gray-500 hover:text-green-700'}`}
            >
              {t.home}
            </button>
            
            <div className="relative group h-full flex items-center">
                <button 
                    onClick={() => navigateTo('program-list')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['program-detail', 'program-list'].includes(currentView) ? 'text-green-700' : 'text-gray-500 hover:text-green-700'}`}
                >
                    {t.programs}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                
                <div className="absolute top-full left-0 w-72 bg-white shadow-xl rounded-b-xl border border-gray-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[60vh] overflow-y-auto">
                        {activationPrograms.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Activation</div>
                                {activationPrograms.map((promo) => (
                                    <div 
                                        key={promo.id}
                                        onClick={() => handleProgramClick(promo.id)}
                                        className="px-4 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{promo.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{promo.brand}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {awoPrograms.length > 0 && (
                            <div className="py-2 border-t border-gray-100">
                                <div className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">AWO</div>
                                {awoPrograms.map((promo) => (
                                    <div 
                                        key={promo.id}
                                        onClick={() => handleProgramClick(promo.id)}
                                        className="px-4 py-2.5 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0"
                                    >
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{promo.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{promo.brand}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                         <button 
                            onClick={() => navigateTo('program-list')}
                            className="text-xs font-bold text-green-700 hover:underline"
                        >
                            {t.allPrograms}
                        </button>
                    </div>
                </div>
            </div>

            <button 
              onClick={() => navigateTo('activation')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'activation' ? 'text-green-700' : 'text-gray-500 hover:text-green-700'}`}
            >
              {t.schedule}
            </button>

            <button 
              onClick={() => navigateTo('awo-schedule')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'awo-schedule' ? 'text-green-700' : 'text-gray-500 hover:text-green-700'}`}
            >
              {t.awo}
            </button>

            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all border border-gray-200"
            >
                <Languages className="w-3.5 h-3.5" />
                <span className="uppercase">{language}</span>
            </button>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200"
            >
                <span className="uppercase">{language}</span>
            </button>
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-green-700 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-x-0 top-20 bottom-0 bg-white z-40 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-2">
            
            <button 
                onClick={() => navigateTo('home')}
                className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold ${currentView === 'home' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                <Home className="w-5 h-5" /> {t.home}
            </button>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button 
                    onClick={() => setIsProgramsExpanded(!isProgramsExpanded)}
                    className={`flex items-center justify-between w-full p-4 font-bold ${['program-detail', 'program-list'].includes(currentView) ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5" /> {t.programs}
                    </div>
                    {isProgramsExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                {isProgramsExpanded && (
                    <div className="bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <button 
                            onClick={() => navigateTo('program-list')}
                            className="w-full text-left px-12 py-3 text-xs font-black text-green-700 uppercase hover:bg-green-100"
                        >
                            → {t.allPrograms}
                        </button>
                        
                        {activationPrograms.length > 0 && (
                            <div>
                                <div className="px-12 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Activation</div>
                                {activationPrograms.map(promo => (
                                    <button 
                                        key={promo.id}
                                        onClick={() => handleProgramClick(promo.id)}
                                        className="w-full text-left px-12 py-3 text-sm text-gray-600 border-b border-gray-200/50 hover:bg-green-100"
                                    >
                                        {promo.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {awoPrograms.length > 0 && (
                            <div className="mt-2">
                                <div className="px-12 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">AWO</div>
                                {awoPrograms.map(promo => (
                                    <button 
                                        key={promo.id}
                                        onClick={() => handleProgramClick(promo.id)}
                                        className="w-full text-left px-12 py-3 text-sm text-gray-600 border-b border-gray-200/50 hover:bg-green-100"
                                    >
                                        {promo.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button 
                onClick={() => navigateTo('activation')}
                className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold ${currentView === 'activation' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                <Calendar className="w-5 h-5" /> {t.schedule}
            </button>

            <button 
                onClick={() => navigateTo('awo-schedule')}
                className={`flex items-center gap-3 p-4 rounded-xl text-left font-bold ${currentView === 'awo-schedule' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
                <MapPin className="w-5 h-5" /> {t.awo}
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
