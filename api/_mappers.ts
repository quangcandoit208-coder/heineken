import type { DataWarning, ProgramEvent, ProgramType, Promotion, Region } from '../types';
import {
  addWarning,
  cleanText,
  normalizeDate,
  normalizeHeader,
  normalizeLink,
  slugify,
  splitList,
} from './_validators.js';

type RowObject = {
  rowNumber: number;
  get: (...aliases: string[]) => string;
};

type ToRowsOptions = {
  headerRowIndex?: number;
  headerRowCount?: number;
};

const toRows = (values: string[][], options: ToRowsOptions = {}): RowObject[] => {
  const headerRowIndex = options.headerRowIndex || 0;
  const headerRowCount = options.headerRowCount || 1;
  const headerRows = values.slice(headerRowIndex, headerRowIndex + headerRowCount);
  const columnCount = Math.max(0, ...headerRows.map(row => row.length));
  const headers = Array.from({ length: columnCount }, (_, columnIndex) => {
    for (let rowIndex = headerRows.length - 1; rowIndex >= 0; rowIndex -= 1) {
      const header = cleanText(headerRows[rowIndex]?.[columnIndex]);
      if (header) return header;
    }
    return '';
  });
  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (normalized) headerMap.set(normalized, index);
  });

  return values.slice(headerRowIndex + headerRowCount).map((row, rowIndex) => ({
    rowNumber: headerRowIndex + headerRowCount + rowIndex + 1,
    get: (...aliases: string[]) => {
      for (const alias of aliases) {
        const index = headerMap.get(normalizeHeader(alias));
        if (index !== undefined) return cleanText(row[index]);
      }
      return '';
    },
  }));
};

const findHeaderRowIndex = (values: string[][], aliases: string[], minimumMatches: number) => {
  let bestIndex = 0;
  let bestScore = 0;
  const normalizedAliases = aliases.map(normalizeHeader);

  values.forEach((row, rowIndex) => {
    const normalizedCells = new Set(row.map(cell => normalizeHeader(cell)));
    const score = normalizedAliases.filter(alias => normalizedCells.has(alias)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = rowIndex;
    }
  });

  return bestScore >= minimumMatches ? bestIndex : 0;
};

const toProgramType = (value: string): ProgramType | null => {
  const normalized = cleanText(value).toLowerCase();
  if (normalized === 'activation') return 'Activation';
  if (normalized === 'awo') return 'AWO';
  return null;
};

export const mapTotalCampaigns = (values: string[][], warnings: DataWarning[]): Promotion[] => {
  const headerRowIndex = findHeaderRowIndex(values, ['Brand', 'Title', 'Type'], 2);
  const rows = toRows(values, { headerRowIndex });

  return rows.flatMap(row => {
    const title = row.get('Title', 'Campaign Title', 'Program Title', 'Tên chương trình', 'Ten chuong trinh');
    const brand = row.get('Brand', 'Nhãn hàng', 'Nhan hang');
    const typeValue = row.get('Type (Activation/AWO)', 'Type', 'Program Type', 'Loại chương trình', 'Loai chuong trinh');
    const type = toProgramType(typeValue);

    if (!title && !brand && !typeValue) return [];
    if (!title) {
      addWarning(warnings, 'TotalCampaigns', row.rowNumber, 'Title', 'Missing campaign title');
      return [];
    }
    if (!type) {
      addWarning(warnings, 'TotalCampaigns', row.rowNumber, 'Type', `Invalid campaign type: ${typeValue}`);
      return [];
    }

    const bu = row.get('BU (VD: GHCM,NO,CE,MKD)', 'BU', 'Region (Dữ liệu: GHCM, NO, CE, MKD)', 'Region', 'Regions');
    const startDate = normalizeDate(row.get('Start Date', 'Start', 'Ngày bắt đầu', 'Ngay bat dau'));
    const endDate = normalizeDate(row.get('End Date', 'End', 'Ngày kết thúc', 'Ngay ket thuc'));

    if (!startDate) {
      addWarning(warnings, 'TotalCampaigns', row.rowNumber, 'Start Date', 'Missing or invalid start date');
    }
    if (!endDate) {
      addWarning(warnings, 'TotalCampaigns', row.rowNumber, 'End Date', 'Missing or invalid end date');
    }

    return [{
      id: slugify(`${brand}-${type}-${title}-${startDate || row.rowNumber}`),
      title,
      brand,
      content: row.get('Content', 'Description', 'Mô tả', 'Mo ta'),
      image: normalizeLink(row.get('PC Image Link', 'Desktop Image Link', 'Image', 'Image Link')),
      mobileImage: normalizeLink(row.get('Mobile Image Link', 'Mobile Image', 'Mobile Link')),
      type,
      startDate,
      endDate,
      regions: splitList(bu) as Region[],
      cities: [],
      bu,
      venueListLink: normalizeLink(row.get('Venue List Link (AWO only) - Dán link không rút gọn', 'Venue List Link', 'Venue List', 'Maps Link')),
    }];
  });
};

export const mapActivationEvents = (values: string[][], warnings: DataWarning[]): ProgramEvent[] => {
  const headerRowIndex = findHeaderRowIndex(values, ['Brand', 'Outlet ID', 'Outlet Name', 'Date', 'Province'], 3);
  const rows = toRows(values, { headerRowIndex, headerRowCount: 3 });

  return rows.flatMap(row => {
    const brand = row.get('Brand');
    const outletId = row.get('Outlet ID');
    const venue = row.get('Outlet Name');
    const date = normalizeDate(row.get('Date'));

    if (!brand && !venue && !date) return [];
    if (!date) {
      addWarning(warnings, 'Activation', row.rowNumber, 'Date', 'Missing or invalid activation date');
      return [];
    }
    if (!venue) {
      addWarning(warnings, 'Activation', row.rowNumber, 'Outlet Name', 'Missing outlet name');
    }

    const street = row.get('Street');
    const district = row.get('District');
    const cityValue = row.get('City');
    const province = row.get('Province');
    const workingTime = row.get('WORKING TIME', 'Working Time');
    const checkIn = row.get('Check in Time');
    const checkOut = row.get('Check out Time');
    const time = workingTime || [checkIn, checkOut].filter(Boolean).join(' - ');
    const address = [street, district, cityValue, province].filter(Boolean).join(', ');

    return [{
      id: slugify(`${outletId || venue}-${date}-${row.rowNumber}`),
      brand,
      scale: row.get('Scale'),
      bu: row.get('BU'),
      region: row.get('Region'),
      outletId,
      venue,
      address,
      mapLink: normalizeLink(row.get('Link GG Maps (Không rút gọn)', 'Link GG Maps', 'Link GG Maps (Khong rut gon)')),
      ward: '',
      city: province || cityValue,
      district,
      province,
      saleRep: row.get('Sale Rep Name'),
      hardPhoneContactSale: row.get('Hard Phone Contact Sale'),
      date,
      time,
      act: row.get('Act'),
      typeOfOutlet: row.get('Type of outlet'),
      updated: row.get('Update?'),
    }];
  });
};
