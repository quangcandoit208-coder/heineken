import type { CalendarDataResponse, DataWarning } from '../types';
import { readSheetRange } from './_googleSheets.js';
import { mapActivationEvents, mapTotalCampaigns } from './_mappers.js';

const activationSources = [
  {
    key: 'IOB',
    envName: 'GOOGLE_ACTIVATION_IOB_RANGE',
    defaultRange: "'IOB'!B6:V",
  },
  {
    key: 'FOCUS',
    envName: 'GOOGLE_ACTIVATION_FOCUS_RANGE',
    defaultRange: "'FOCUS'!B6:V",
  },
  {
    key: 'GS',
    envName: 'GOOGLE_ACTIVATION_GS_RANGE',
    defaultRange: "'GS'!B6:V",
  },
];

export default async function handler(_req: any, res: any) {
  try {
    const totalCampaignsRange = process.env.GOOGLE_TOTAL_CAMPAIGNS_RANGE || "'Total Campaigns'!A3:L";
    const warnings: DataWarning[] = [];

    const [campaignRows, ...activationRowsBySource] = await Promise.all([
      readSheetRange(totalCampaignsRange),
      ...activationSources.map(source => readSheetRange(process.env[source.envName] || source.defaultRange)),
    ]);

    const promotions = mapTotalCampaigns(campaignRows, warnings);
    const programsByCode = new Map(promotions.map(program => [program.id, program]));
    const activationEvents = activationRowsBySource.flatMap((rows, index) => {
      const source = activationSources[index];
      return mapActivationEvents(rows, warnings, {
        sourceSheet: source.key,
        programsByCode,
      });
    });

    const response: CalendarDataResponse = {
      promotions,
      activationEvents,
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
