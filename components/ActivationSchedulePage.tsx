
import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from './FilterBar';
import EventTable from './EventTable';
import PaginationControls from './PaginationControls';
import { FilterState, ProgramEvent, SortConfig, SortField, AppSettings } from '../types';
import { usePagination } from '../hooks/usePagination';

interface ActivationSchedulePageProps {
  events: ProgramEvent[];
  settings?: AppSettings;
  initialBrandFilter?: string | null;
  language: 'vi' | 'en';
}

const ActivationSchedulePage: React.FC<ActivationSchedulePageProps> = ({ events, settings, initialBrandFilter, language }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    brand: '',
    bu: '', // Initialize bu filter
    dateFrom: '',
    dateTo: ''
  });

  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    setFilters(prev => ({ ...prev, brand: initialBrandFilter || '' }));
  }, [initialBrandFilter]);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    order: 'asc'
  });

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: '',
      brand: '',
      bu: '',
      dateFrom: '',
      dateTo: ''
    });
    setShowPastEvents(false);
  };

  const provinceOptions = useMemo(() => {
    return Array.from(new Set(events.map(event => event.province || event.city).filter(Boolean))).sort();
  }, [events]);

  const processedEvents = useMemo(() => {
    let result = [...events];
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(e => 
        e.venue.toLowerCase().includes(searchLower) || 
        e.address.toLowerCase().includes(searchLower) ||
        (e.eventName || '').toLowerCase().includes(searchLower)
      );
    }
    if (filters.city) {
      result = result.filter(e => (e.province || e.city) === filters.city);
    }
    if (filters.bu) {
      result = result.filter(e => e.bu === filters.bu);
    }
    if (filters.brand) {
      result = result.filter(e => e.brand === filters.brand);
    }
    
    if (filters.dateFrom) {
      result = result.filter(e => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(e => e.date <= filters.dateTo);
    }

    if (!showPastEvents) {
        result = result.filter(e => !e.date || e.date >= today);
    }

    const getDateTimeKey = (event: ProgramEvent) => {
      if (!event.date) return null;
      return `${event.date} ${event.checkInTime || '99:99'}`;
    };

    const compareNullable = (aValue: string | null | undefined, bValue: string | null | undefined) => {
      const aMissing = !aValue;
      const bMissing = !bValue;
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    };

    result.sort((a, b) => {
      const isPastA = a.date ? a.date < today : false;
      const isPastB = b.date ? b.date < today : false;

      if (isPastA !== isPastB) {
          return isPastA ? 1 : -1;
      }

      if (sortConfig.field === 'date') {
        return compareNullable(getDateTimeKey(a), getDateTimeKey(b));
      }

      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      return compareNullable(
        typeof aValue === 'string' ? aValue : aValue?.toString(),
        typeof bValue === 'string' ? bValue : bValue?.toString(),
      );
    });

    return result;
  }, [events, filters, sortConfig, showPastEvents]);

  const {
    currentPage,
    pageSize,
    paginatedItems: paginatedEvents,
    setCurrentPage,
    totalItems,
    totalPages,
  } = usePagination(processedEvents, 20);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig, showPastEvents, setCurrentPage]);

  const t = {
    title: language === 'vi' ? 'Lịch trình Activation' : 'Activation Schedule',
    subtitle: language === 'vi' ? settings?.scheduleSubtitle || 'Tìm kiếm và theo dõi các hoạt động mới nhất.' : 'Search and track the latest activities.'
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12 relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l7.5 22.5h22.5l-18 13.5 7.5 22.5-18-13.5-18 13.5 7.5-22.5-18-13.5h22.5z' fill='%23FFFFFF' stroke='%23d1d5db' stroke-width='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-3 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4">
            <div>
                <h2 className="text-xl md:text-4xl font-black text-green-900 leading-tight">
                    {t.title}
                </h2>
                <p className="text-[10px] md:text-lg text-gray-500">
                    {t.subtitle}
                </p>
            </div>
        </div>

        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          showPastEvents={showPastEvents}
          setShowPastEvents={setShowPastEvents}
          onReset={handleResetFilters} 
          language={language}
          context="Activation"
          variant="green"
          locationLabel={language === 'vi' ? 'Tỉnh/TP' : 'Province'}
          locationOptions={provinceOptions}
        />

        <EventTable 
          events={paginatedEvents} 
          sortConfig={sortConfig} 
          onSort={handleSort}
          language={language}
          totalEvents={processedEvents.length}
        />

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
  );
};

export default ActivationSchedulePage;
