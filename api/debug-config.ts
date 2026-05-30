const hasValue = (name: string) => Boolean(process.env[name]);

export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    env: {
      GOOGLE_SHEET_ID: hasValue('GOOGLE_SHEET_ID'),
      GOOGLE_CLIENT_EMAIL: hasValue('GOOGLE_CLIENT_EMAIL'),
      GOOGLE_PRIVATE_KEY: hasValue('GOOGLE_PRIVATE_KEY'),
      GOOGLE_TOTAL_CAMPAIGNS_RANGE: process.env.GOOGLE_TOTAL_CAMPAIGNS_RANGE || null,
      GOOGLE_ACTIVATION_IOB_RANGE: process.env.GOOGLE_ACTIVATION_IOB_RANGE || null,
      GOOGLE_ACTIVATION_FOCUS_RANGE: process.env.GOOGLE_ACTIVATION_FOCUS_RANGE || null,
      GOOGLE_ACTIVATION_GS_RANGE: process.env.GOOGLE_ACTIVATION_GS_RANGE || null,
    },
    updatedAt: new Date().toISOString(),
  });
}
