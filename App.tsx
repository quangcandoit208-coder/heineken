import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import SchedulePage from './components/SchedulePage';
import AWOSchedulePage from './components/AWOSchedulePage';
import ProgramDetailPage from './components/ProgramDetailPage';
import ProgramListPage from './components/ProgramListPage';
import { AppSettings, DataWarning, ProgramEvent, View } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { fetchCalendarData } from './services/calendarDataClient';

const INITIAL_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS
};

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [warnings, setWarnings] = useState<DataWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [initialScheduleBrand, setInitialScheduleBrand] = useState<string | null>(null);

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
    setCurrentView('program-detail');
  };

  const handleViewScheduleWithBrand = (brand: string) => {
      setInitialScheduleBrand(brand);
      setCurrentView('schedule');
  };

  const getSelectedProgram = () => {
    return settings.promotions.find(p => p.id === selectedProgramId);
  };

  const handleSetCurrentView = (view: View) => {
      if (view !== 'schedule') {
          setInitialScheduleBrand(null);
      }
      setCurrentView(view);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
  };

  const loadCalendarData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCalendarData();
      setEvents(data.activationEvents || []);
      setWarnings(data.warnings || []);
      setSettings(prev => ({
        ...prev,
        promotions: data.promotions || []
      }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu từ Google Sheet.');
      setEvents([]);
      setWarnings([]);
      setSettings(INITIAL_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const t = {
    loading: language === 'vi' ? 'Đang tải dữ liệu từ Google Sheet...' : 'Loading Google Sheet data...',
    errorTitle: language === 'vi' ? 'Không tải được dữ liệu' : 'Unable to load data',
    retry: language === 'vi' ? 'Thử lại' : 'Retry',
    warningTitle: language === 'vi' ? 'Cảnh báo dữ liệu Google Sheet' : 'Google Sheet data warnings',
    warningMore: language === 'vi' ? 'cảnh báo khác' : 'more warnings',
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar 
        currentView={currentView} 
        setCurrentView={handleSetCurrentView} 
        settings={settings}
        onSelectProgram={handleSelectProgram}
        language={language}
        toggleLanguage={toggleLanguage}
      />

      {warnings.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900">
          <div className="max-w-7xl mx-auto text-xs sm:text-sm">
            <p className="font-bold">{t.warningTitle}: {warnings.length}</p>
            <div className="mt-1 space-y-0.5">
              {warnings.slice(0, 3).map((warning, index) => (
                <p key={`${warning.sheet}-${warning.row}-${warning.field}-${index}`}>
                  {warning.sheet} row {warning.row} [{warning.field}]: {warning.message}
                </p>
              ))}
              {warnings.length > 3 && (
                <p className="font-medium">+{warnings.length - 3} {t.warningMore}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <main>
        {isLoading && (
          <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
            <div>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700"></div>
              <p className="text-sm font-bold text-gray-600">{t.loading}</p>
            </div>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-lg rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-black text-red-700">{t.errorTitle}</h2>
              <p className="mt-2 text-sm text-gray-500">{loadError}</p>
              <button
                onClick={loadCalendarData}
                className="mt-5 rounded-full bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-800"
              >
                {t.retry}
              </button>
            </div>
          </div>
        )}

        {!isLoading && !loadError && (
          <>
        {currentView === 'home' && (
          <HomePage 
            setCurrentView={handleSetCurrentView} 
            settings={settings} 
            onSelectProgram={handleSelectProgram}
            onViewScheduleWithBrand={handleViewScheduleWithBrand}
            language={language}
          />
        )}
        
        {currentView === 'schedule' && (
          <SchedulePage 
            events={events} 
            settings={settings} 
            initialBrandFilter={initialScheduleBrand}
            language={language}
          />
        )}

        {currentView === 'awo-schedule' && (
          <AWOSchedulePage 
            promotions={settings.promotions}
            language={language}
          />
        )}

        {currentView === 'program-list' && (
            <ProgramListPage 
                promotions={settings.promotions}
                onSelectProgram={handleSelectProgram}
                setCurrentView={handleSetCurrentView}
                language={language}
            />
        )}

        {currentView === 'program-detail' && (
            <ProgramDetailPage 
                program={getSelectedProgram()} 
                onBack={() => handleSetCurrentView('program-list')}
                setCurrentView={handleSetCurrentView}
                onViewScheduleWithBrand={handleViewScheduleWithBrand}
                language={language}
            />
        )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
