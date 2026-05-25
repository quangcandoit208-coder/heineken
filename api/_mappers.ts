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

const toRows = (values: string[][]): RowObject[] => {
  const headers = values[0] || [];
  const headerMap = new Map<string, number>();

  headers.forEach((header, index) => {
    headerMap.set(normalizeHeader(header), index);
  });

  return values.slice(1).map((row, rowIndex) => ({
    rowNumber: rowIndex + 2,
    get: (...aliases: string[]) => {
      for (const alias of aliases) {
        const index = headerMap.get(normalizeHeader(alias));
        if (index !== undefined) return cleanText(row[index]);
      }
      return '';
    },
  }));
};

const toProgramType = (value: string): ProgramType | null => {
  const normalized = cleanText(value).toLowerCase();
  if (normalized === 'activation') return 'Activation';
  if (normalized === 'awo') return 'AWO';
  return null;
};

export const mapTotalCampaigns = (values: string[][], warnings: DataWarning[]): Promotion[] => {
  const rows = toRows(values);

  return rows.flatMap(row => {
    const title = row.get('Title');
    const brand = row.get('Brand');
    const typeValue = row.get('Type (Activation/AWO)', 'Type');
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

    const bu = row.get('BU (VD: GHCM,NO,CE,MKD)', 'BU');
    const startDate = normalizeDate(row.get('Start Date'));
    const endDate = normalizeDate(row.get('End Date'));

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
      content: row.get('Content'),
      image: normalizeLink(row.get('PC Image Link')),
      mobileImage: normalizeLink(row.get('Mobile Image Link')),
      type,
      startDate,
      endDate,
      regions: splitList(bu) as Region[],
      cities: [],
      bu,
      venueListLink: normalizeLink(row.get('Venue List Link (AWO only) - Dán link không rút gọn', 'Venue List Link')),
    }];
  });
};

export const mapActivationEvents = (values: string[][], warnings: DataWarning[]): ProgramEvent[] => {
  const rows = toRows(values);

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
