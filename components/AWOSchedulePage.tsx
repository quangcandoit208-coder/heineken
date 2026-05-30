
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from './FilterBar';
import PaginationControls from './PaginationControls';
import { Promotion, FilterState, PromotionSortConfig, PromotionSortField } from '../types';
import { Calendar, ExternalLink, MapPin, Layers, Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { REGIONS } from '../constants';
import { usePagination } from '../hooks/usePagination';

interface AWOSchedulePageProps {
  promotions: Promotion[];
  language: 'vi' | 'en';
}

const AWOSchedulePage: React.FC<AWOSchedulePageProps> = ({ promotions, language }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '', // This will store the BU/Region selection
    brand: '',
    dateFrom: '',
    dateTo: ''
  });

  const [sortConfig, setSortConfig] = useState<PromotionSortConfig>({
    field: 'startDate',
    order: 'asc'
  });

  const [showPastEvents, setShowPastEvents] = useState(false);

  const awoPromotions = useMemo(() => promotions.filter(p => p.type === 'AWO'), [promotions]);

  const handleSort = (field: PromotionSortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: PromotionSortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />;
    return sortConfig.order === 'asc' ? 
      <ArrowUp className="w-3 h-3 text-green-700" /> : 
      <ArrowDown className="w-3 h-3 text-green-700" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const daysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return language === 'vi' ? daysVi[date.getDay()] : date.toLocaleDateString('en-US', {weekday: 'short'});
  };

  const getBrandTagClasses = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('tiger')) return 'bg-orange-50 text-orange-500 border-orange-100';
    if (b.includes('heineken')) return 'bg-green-50 text-green-600 border-green-100';
    return 'bg-blue-50 text-blue-500 border-blue-100';
  };

  const processedAwo = useMemo(() => {
    let result = [...awoPromotions];
    const today = new Date().toISOString().split('T')[0];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(searchLower));
    }
    // Filter by Region/BU instead of City
    if (filters.city) {
        result = result.filter(p => p.regions.includes(filters.city as any) || p.bu === filters.city);
    }
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.dateFrom) result = result.filter(p => p.endDate >= filters.dateFrom);
    if (filters.dateTo) result = result.filter(p => p.startDate <= filters.dateTo);

    if (!showPastEvents) {
      result = result.filter(p => p.endDate >= today);
    }

    result.sort((a, b) => {
      let aV: any = a[sortConfig.field];
      let bV: any = b[sortConfig.field];
      if (aV < bV) return sortConfig.order === 'asc' ? -1 : 1;
      if (aV > bV) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [awoPromotions, filters, showPastEvents, sortConfig]);

  const {
    currentPage,
    pageSize,
    paginatedItems: paginatedAwo,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(processedAwo, 20);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig, showPastEvents, setCurrentPage]);

  const t = {
    title: language === 'vi' ? 'Lịch Chương Trình AWO' : 'AWO Schedule',
    subtitle: language === 'vi' ? 'Khám phá ưu đãi tại điểm bán trên toàn quốc.' : 'Discover offers at sales points nationwide.',
    colProgram: language === 'vi' ? 'Chương trình' : 'Program',
    colTime: language === 'vi' ? 'Thời gian' : 'Time',
    colBU: 'BU',
    colVenues: language === 'vi' ? 'Quán' : 'Venues',
    viewMap: language === 'vi' ? 'Bản Đồ' : 'Map',
    results: language === 'vi' ? 'kết quả' : 'results',
    swipeNote: language === 'vi' ? '* Kéo bảng qua trái để xem thông tin đầy đủ' : '* Swipe left for full info',
    running: language === 'vi' ? 'Đang chạy' : 'Running'
  };

  const HeaderCell = ({ field, label, icon: Icon, className = "" }: { field: PromotionSortField; label: string, icon: React.ElementType, className?: string }) => (
    <th onClick={() => handleSort(field)} className={`px-2 py-3 sm:px-6 sm:py-4 text-left text-[10px] md:text-sm font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sticky top-0 bg-gray-50 z-10 ${className}`}>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-gray-400" />
        <span className="truncate">{label}</span>
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-3 sm:mb-6">
            <h2 className="text-xl md:text-4xl font-black text-green-900 leading-tight">{t.title}</h2>
            <p className="text-[10px] md:text-lg text-gray-500">{t.subtitle}</p>
        </div>
        
        <FilterBar 
          filters={filters} setFilters={setFilters} 
          showPastEvents={showPastEvents} setShowPastEvents={setShowPastEvents}
          onReset={() => setFilters({search: '', city: '', brand: '', dateFrom: '', dateTo: ''})} 
          language={language} context="AWO" variant="green"
          locationLabel="BU"
          locationOptions={REGIONS}
        />

        <div className="space-y-1.5 mt-4">
          <p className="text-[10px] text-gray-500 italic block sm:hidden px-1">{t.swipeNote}</p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <HeaderCell field="title" label={t.colProgram} icon={Layers} className="w-32 sm:w-auto" />
                    <HeaderCell field="startDate" label={t.colTime} icon={Calendar} className="w-24 sm:w-auto" />
                    <HeaderCell field="bu" label={t.colBU} icon={Building2} className="w-24 sm:w-auto" />
                    <th className="px-2 py-3 text-left text-[10px] md:text-sm font-bold text-gray-600 uppercase w-20 sm:w-auto"><MapPin className="w-3 h-3 inline mr-1 text-gray-400" /> {t.colVenues}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAwo.map((p) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isRunning = p.startDate <= today && p.endDate >= today;
                    const displayBU = p.bu || (p.regions.length > 0 ? p.regions[0] : '');
                    
                    return (
                      <tr key={p.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-2 py-2 sm:px-6 sm:py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-1.5 py-0.5 rounded text-[9px] md:text-xs font-medium border ${getBrandTagClasses(p.brand)} leading-none`}>{p.brand}</span>
                            <Link
                              to={`/programs/${encodeURIComponent(p.id)}`}
                              className="text-[11px] md:text-base font-bold text-gray-900 leading-tight line-clamp-2 hover:text-green-700 hover:underline"
                            >
                              {p.title}
                            </Link>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex gap-1 mb-0.5">
                              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-full text-[8px] font-medium border border-gray-100 capitalize leading-none">{getDayName(p.startDate)}</span>
                              {isRunning && <span className="px-1.5 py-0.5 bg-green-50 text-green-500 rounded-full text-[8px] font-medium border border-green-100 capitalize leading-none">{t.running}</span>}
                            </div>
                            <div className="text-[11px] md:text-base text-gray-600 font-medium leading-tight">
                                <div className={sortConfig.field === 'startDate' ? 'font-bold text-green-700' : ''}>{formatDate(p.startDate)}</div>
                                <div className="text-gray-200 text-[10px] text-center leading-none my-0.5">↓</div>
                                <div>{formatDate(p.endDate)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4">
                          <div className="flex flex-wrap gap-1 max-w-[100px] sm:max-w-none">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-sm font-black border border-blue-200 leading-none shadow-sm uppercase">{displayBU}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4">
                          {p.venueListLink && (
                            <a href={p.venueListLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-green-700 text-white text-[9px] md:text-xs font-bold rounded-full shadow-sm">
                              {t.viewMap} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-3 py-2 text-[10px] text-gray-400 italic border-t border-gray-100">
              {processedAwo.length} {t.results}
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AWOSchedulePage;
