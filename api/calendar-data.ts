import type { CalendarDataResponse, DataWarning } from '../types';
import { readSheetRange } from './_googleSheets.js';
import { mapActivationEvents, mapTotalCampaigns } from './_mappers.js';

export default async function handler(_req: any, res: any) {
  try {
    const totalCampaignsRange = process.env.GOOGLE_TOTAL_CAMPAIGNS_RANGE || "'Total Campaigns'!A3:L";
    const activationRange = process.env.GOOGLE_ACTIVATION_RANGE || "'Activation Template'!B6:U";
    const warnings: DataWarning[] = [];

    const [campaignRows, activationRows] = await Promise.all([
      readSheetRange(totalCampaignsRange),
      readSheetRange(activationRange),
    ]);

    const response: CalendarDataResponse = {
      promotions: mapTotalCampaigns(campaignRows, warnings),
      activationEvents: mapActivationEvents(activationRows, warnings),
      warnings,
      updatedAt: new Date().toISOString(),
    };

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    res.status(500).json({
      error: message,
      promotions: [],
      activationEvents: [],
      warnings: [{
        sheet: 'TotalCampaigns',
        row: 0,
        field: 'api',
        message,
      }],
      updatedAt: new Date().toISOString(),
    });
  }
}
