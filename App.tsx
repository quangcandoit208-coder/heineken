import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import ActivationSchedulePage from './components/ActivationSchedulePage';
import AWOSchedulePage from './components/AWOSchedulePage';
import ProgramDetailPage from './components/ProgramDetailPage';
import ProgramListPage from './components/ProgramListPage';
import { AppSettings, DataWarning, ProgramEvent, View } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { fetchCalendarData } from './services/calendarDataClient';

const INITIAL_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS
};

const getCurrentView = (pathname: string): View => {
  if (pathname === '/activation' || pathname === '/schedule') return 'activation';
  if (pathname === '/awo' || pathname === '/awo-schedule') return 'awo-schedule';
  if (pathname.startsWith('/programs/')) return 'program-detail';
  if (pathname === '/programs') return 'program-list';
  return 'home';
};

function CalendarApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = getCurrentView(location.pathname);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [events, setEvents] = useState<ProgramEvent[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [warnings, setWarnings] = useState<DataWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSelectProgram = (id: string) => {
    navigate(`/programs/${encodeURIComponent(id)}`);
  };

  const handleViewScheduleWithBrand = (brand: string) => {
    navigate(`/activation?brand=${encodeURIComponent(brand)}`);
  };

  const handleSetCurrentView = (view: View) => {
    const paths: Record<View, string> = {
      home: '/',
      activation: '/activation',
      'awo-schedule': '/awo',
      'program-list': '/programs',
      'program-detail': '/programs',
    };
    navigate(paths[view]);
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
  }, [location.pathname, location.search]);

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
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  setCurrentView={handleSetCurrentView}
                  settings={settings}
                  onSelectProgram={handleSelectProgram}
                  onViewScheduleWithBrand={handleViewScheduleWithBrand}
                  language={language}
                />
              }
            />
            <Route
              path="/activation"
              element={
                <ActivationRoute
                  events={events}
                  settings={settings}
                  language={language}
                />
              }
            />
            <Route path="/schedule" element={<Navigate to="/activation" replace />} />
            <Route
              path="/awo"
              element={
                <AWOSchedulePage
                  promotions={settings.promotions}
                  language={language}
                />
              }
            />
            <Route path="/awo-schedule" element={<Navigate to="/awo" replace />} />
            <Route
              path="/programs"
              element={
                <ProgramListPage
                  promotions={settings.promotions}
                  onSelectProgram={handleSelectProgram}
                  setCurrentView={handleSetCurrentView}
                  language={language}
                />
              }
            />
            <Route
              path="/programs/:programId"
              element={
                <ProgramDetailRoute
                  promotions={settings.promotions}
                  onBack={() => handleSetCurrentView('program-list')}
                  setCurrentView={handleSetCurrentView}
                  onViewScheduleWithBrand={handleViewScheduleWithBrand}
                  language={language}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

interface ActivationRouteProps {
  events: ProgramEvent[];
  settings: AppSettings;
  language: 'vi' | 'en';
}

const ActivationRoute: React.FC<ActivationRouteProps> = ({ events, settings, language }) => {
  const [searchParams] = useSearchParams();

  return (
    <ActivationSchedulePage
      events={events}
      settings={settings}
      initialBrandFilter={searchParams.get('brand')}
      language={language}
    />
  );
};

interface ProgramDetailRouteProps {
  promotions: AppSettings['promotions'];
  onBack: () => void;
  setCurrentView: (view: View) => void;
  onViewScheduleWithBrand: (brand: string) => void;
  language: 'vi' | 'en';
}

const ProgramDetailRoute: React.FC<ProgramDetailRouteProps> = ({
  promotions,
  onBack,
  setCurrentView,
  onViewScheduleWithBrand,
  language,
}) => {
  const { programId } = useParams();
  const program = promotions.find(p => p.id === programId);

  return (
    <ProgramDetailPage
      program={program}
      onBack={onBack}
      setCurrentView={setCurrentView}
      onViewScheduleWithBrand={onViewScheduleWithBrand}
      language={language}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <CalendarApp />
    </BrowserRouter>
  );
}

export default App;
