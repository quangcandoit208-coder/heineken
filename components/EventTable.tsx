
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, MapPin, Clock, Home, Info, Tag, CalendarDays } from 'lucide-react';
import { ProgramEvent, SortConfig, SortField } from '../types';

interface EventTableProps {
  events: ProgramEvent[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  language: 'vi' | 'en';
  totalEvents?: number;
}

const EventTable: React.FC<EventTableProps> = ({ events, sortConfig, onSort, language, totalEvents }) => {
  const dateBoundaries = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const formatDateToISO = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - diffToMonday);
    
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);

    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);

    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    return {
      today: formatDateToISO(today),
      tomorrow: formatDateToISO(tomorrow),
      thisWeekStart: formatDateToISO(startOfThisWeek),
      thisWeekEnd: formatDateToISO(endOfThisWeek),
      nextWeekStart: formatDateToISO(startOfNextWeek),
      nextWeekEnd: formatDateToISO(endOfNextWeek),
    };
  }, []);

  const getDayName = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const daysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return language === 'vi' ? daysVi[date.getDay()] : daysEn[date.getDay()];
  };

  const isToday = (dateString: string) => Boolean(dateString) && dateString === dateBoundaries.today;
  const isTomorrow = (dateString: string) => Boolean(dateString) && dateString === dateBoundaries.tomorrow;
  const isPast = (dateString: string) => Boolean(dateString) && dateString < dateBoundaries.today;
  
  const isThisWeek = (dateString: string) => {
    if (!dateString) return false;
    return dateString >= dateBoundaries.thisWeekStart && 
           dateString <= dateBoundaries.thisWeekEnd && 
           !isToday(dateString) && 
           !isTomorrow(dateString);
  };

  const isNextWeek = (dateString: string) => {
    if (!dateString) return false;
    return dateString >= dateBoundaries.nextWeekStart && 
           dateString <= dateBoundaries.nextWeekEnd;
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`;
    }
    return dateString;
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />;
    return sortConfig.order === 'asc' ? 
      <ArrowUp className="w-3 h-3 text-green-700" /> : 
      <ArrowDown className="w-3 h-3 text-green-700" />;
  };

  const getBrandTagClasses = (brand: string, past: boolean) => {
    if (past) return 'bg-gray-100 text-gray-400 border-gray-100';
    const b = brand.toLowerCase();
    if (b.includes('tiger')) return 'bg-orange-50 text-orange-500 border-orange-100';
    if (b.includes('heineken')) return 'bg-green-50 text-green-500 border-green-100';
    return 'bg-blue-50 text-blue-500 border-blue-100';
  };

  const getScaleTagClasses = (scale: string) => {
    const normalized = scale.trim().toLowerCase();
    if (normalized === 'full') return 'bg-purple-50 text-purple-600 border-purple-100';
    if (normalized === 'basic') return 'bg-teal-50 text-teal-600 border-teal-100';
    if (normalized === 'tạ hiện' || normalized === 'ta hien') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (normalized === 'roving') return 'bg-sky-50 text-sky-600 border-sky-100';
    if (normalized === 'fix activation') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const t = {
    province: language === 'vi' ? 'Tỉnh/TP' : 'Province',
    time: language === 'vi' ? 'Thời gian' : 'Time',
    eventName: language === 'vi' ? 'Tên event' : 'Event',
    brand: 'Brand',
    venue: language === 'vi' ? 'Tên quán' : 'Venue',
    address: language === 'vi' ? 'Địa chỉ' : 'Address',
    today: language === 'vi' ? 'Hôm nay' : 'Today',
    tomorrow: language === 'vi' ? 'Ngày mai' : 'Tomorrow',
    thisWeek: language === 'vi' ? 'Tuần này' : 'This week',
    nextWeek: language === 'vi' ? 'Tuần sau' : 'Next week',
    results: language === 'vi' ? 'kết quả' : 'results',
    swipeNote: language === 'vi' ? '* Kéo bảng qua trái để xem thông tin đầy đủ' : '* Swipe left for full info'
  };

  const HeaderCell = ({ field, label, icon: Icon, className = "" }: { field: SortField; label: string, icon?: React.ElementType, className?: string }) => (
    <th onClick={() => onSort(field)} className={`px-2 py-3 sm:px-6 sm:py-4 text-left text-[10px] md:text-sm font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sticky top-0 bg-gray-50 z-10 ${className}`}>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-gray-400" />}
        <span className="truncate">{label}</span>
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-gray-500 italic block sm:hidden px-1">{t.swipeNote}</p>
      <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
            <thead className="bg-gray-50">
              <tr>
                <HeaderCell field="date" label={t.time} icon={Clock} className="w-24 sm:w-auto" />
                <HeaderCell field="eventName" label={t.eventName} icon={CalendarDays} className="w-32 sm:w-auto" />
                <HeaderCell field="province" label={t.province} icon={MapPin} className="w-24 sm:w-auto" />
                <HeaderCell field="brand" label={t.brand} icon={Tag} className="w-20 sm:w-auto" />
                <HeaderCell field="venue" label={t.venue} icon={Home} className="w-32 sm:w-auto" />
                <HeaderCell field="address" label={t.address} className="w-40 sm:w-auto" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => {
                const today = isToday(event.date);
                const tomorrow = isTomorrow(event.date);
                const thisWeek = isThisWeek(event.date);
                const nextWeek = isNextWeek(event.date);
                const past = isPast(event.date);
                const dayName = getDayName(event.date);
                const shortDate = formatShortDate(event.date);
                const dateLabel = event.date ? `${dayName}, ${shortDate}` : '-';
                
                return (
                  <tr key={event.id} className={`transition-colors ${past ? 'bg-gray-50 opacity-60 grayscale-[60%]' : 'hover:bg-green-50'}`}>
                    <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex flex-wrap gap-1 mb-0.5">
                          {today && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-red-50 text-red-500 border border-red-100 capitalize leading-none">{t.today}</span>}
                          {tomorrow && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-blue-50 text-blue-500 border border-blue-100 capitalize leading-none">{t.tomorrow}</span>}
                          {thisWeek && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-green-50 text-green-500 border border-green-100 capitalize leading-none">{t.thisWeek}</span>}
                          {nextWeek && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-purple-50 text-purple-500 border border-purple-100 capitalize leading-none">{t.nextWeek}</span>}
                        </div>
                        <span className={`text-[11px] md:text-base font-bold ${past ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {dateLabel}
                        </span>
                        <span className="text-[10px] text-gray-400">{event.time}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`text-[11px] md:text-base font-medium truncate block max-w-[80px] sm:max-w-none ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                        {event.eventName && event.programId ? (
                          <Link to={`/programs/${encodeURIComponent(event.programId)}`} className={past ? 'text-gray-400' : 'text-green-700 hover:underline'}>
                            {event.eventName}
                          </Link>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`text-[11px] md:text-base font-medium truncate block max-w-[90px] sm:max-w-none ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                        {event.province || event.city || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] md:text-xs font-medium border ${getBrandTagClasses(event.brand, past)}`}>
                        {event.brand}
                      </span>
                    </td>
                    <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {event.scale && (
                          <span className={`w-fit px-1 py-0.5 rounded text-[8px] font-medium border ${getScaleTagClasses(event.scale)} capitalize`}>
                            {event.scale}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] md:text-base font-bold truncate max-w-[100px] sm:max-w-none ${past ? 'text-gray-400' : 'text-gray-900'}`}>{event.venue || '-'}</span>
                          <div className="relative group/info">
                            <Info className="w-3 h-3 text-gray-500 hover:text-green-700 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white rounded shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20 text-[10px] pointer-events-none whitespace-normal">
                              <p>Outlet ID: {event.outletId}</p>
                              <p>Region: {event.region}</p>
                              <p>Sale Rep: {event.saleRep}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-6 sm:py-4">
                      {event.mapLink ? (
                        <a 
                          href={event.mapLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`text-[11px] md:text-base truncate block max-w-[120px] sm:max-w-xs ${past ? 'text-gray-400' : 'text-blue-500 hover:underline'}`}
                        >
                          {event.address}
                        </a>
                      ) : (
                        <span className={`text-[11px] md:text-base truncate block max-w-[120px] sm:max-w-xs ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                          {event.address}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400 italic">
          {totalEvents ?? events.length} {t.results}
        </div>
      </div>
    </div>
  );
};

export default EventTable;
