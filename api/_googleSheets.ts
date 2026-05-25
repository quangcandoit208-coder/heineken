import crypto from 'node:crypto';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

const base64Url = (input: string | Buffer) => {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const normalizeRange = (value: string) => {
  return value.trim().replace(/^"(.*)"$/, '$1');
};

const normalizePrivateKey = (value: string) => {
  return value
    .trim()
    .replace(/,$/, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n');
};

const createJwt = () => {
  const clientEmail = getEnv('GOOGLE_CLIENT_EMAIL');
  const privateKey = normalizePrivateKey(getEnv('GOOGLE_PRIVATE_KEY'));
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(privateKey);

  return `${unsignedToken}.${base64Url(signature)}`;
};

const getAccessToken = async () => {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: createJwt(),
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google OAuth failed: ${response.status} ${text}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
};

export const readSheetRange = async (range: string): Promise<string[][]> => {
  const sheetId = getEnv('GOOGLE_SHEET_ID');
  const token = await getAccessToken();
  const normalizedRange = normalizeRange(range);
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(normalizedRange)}`);
  url.searchParams.set('majorDimension', 'ROWS');
  url.searchParams.set('valueRenderOption', 'FORMATTED_VALUE');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Sheets read failed: ${response.status} ${text}`);
  }

  const data = await response.json() as { values?: string[][] };
  return data.values || [];
};
