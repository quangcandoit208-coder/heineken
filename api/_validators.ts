import type { DataWarning } from '../types';

export type SheetName = DataWarning['sheet'];

export const addWarning = (
  warnings: DataWarning[],
  sheet: SheetName,
  row: number,
  field: string,
  message: string,
) => {
  warnings.push({ sheet, row, field, message });
};

export const cleanText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const normalizeHeader = (value: string): string => {
  return cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

export const normalizeDate = (value: unknown): string => {
  const raw = cleanText(value);
  if (!raw) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const serial = Number(raw);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(serial));
    return epoch.toISOString().slice(0, 10);
  }

  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
};

export const splitList = (value: unknown): string[] => {
  return cleanText(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export const normalizeLink = (value: unknown): string => {
  const raw = cleanText(value);
  if (!raw || raw.toUpperCase() === 'N/A') return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(www\.|maps\.|google\.)/i.test(raw)) return `https://${raw}`;
  return raw;
};

export const slugify = (value: string): string => {
  const slug = cleanText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `row-${Date.now()}`;
};
