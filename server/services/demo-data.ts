import { adminDb } from '../firebase-admin';
import { GEMINI_MODEL } from '../config';

export async function seedDemoData(wid: string): Promise<{
  brandCount: number;
  queryCount: number;
  runCount: number;
  reportCount: number;
 }> {
  const now = Date.now();
  const msInDay = 24 * 60 * 60 * 1000;

  // 1. Nigerian Fintech Brands
  const brands = [
    {
      id: 'demo_b_paystack',
      name: 'Paystack',
      kind: 'own' as const,
      aliases: ['Paystack', 'Paystack Nigeria', '@paystack', 'paystack.com'],
      website: 'https://paystack.com',
      isSample: true,
      createdAt: new Date(now - 60 * msInDay).toISOString(),
    },
    {
      id: 'demo_b_flutterwave',
      name: 'Flutterwave',
      kind: 'competitor' as const,
      aliases: ['Flutterwave', 'Flutter wave', '@flutterwave', 'flutterwave.com'],
      website: 'https://flutterwave.com',
      isSample: true,
      createdAt: new Date(now - 60 * msInDay).toISOString(),
    },
    {
      id: 'demo_b_moniepoint',
      name: 'Moniepoint',
      kind: 'competitor' as const,
      aliases: ['Moniepoint', 'Monie point', '@moniepoint', 'moniepoint.com'],
      website: 'https://moniepoint.com',
      isSample: true,
      createdAt: new Date(now - 60 * msInDay).toISOString(),
    },
  ];

  for (const b of brands) {
    await adminDb.doc(`workspaces/${wid}/brands/${b.id}`).set(b);
  }

  // 2. Nigerian Fintech Starter Queries (8 queries)
  const queries = [
    {
      id: 'demo_q_gateways',
      text: 'What is the best payment gateway in Nigeria for developers?',
      category: 'Payments',
      frequency: 'daily' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 56 * msInDay).toISOString(),
      lastRunAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      nextRunAt: new Date(now + 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo_q_recurring',
      text: 'Which payment platform supports automated recurring billing in Lagos?',
      category: 'Recurring payments',
      frequency: 'daily' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 56 * msInDay).toISOString(),
      lastRunAt: new Date(now - 16 * 60 * 60 * 1000).toISOString(),
      nextRunAt: new Date(now + 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo_q_merchants',
      text: 'What are the top-rated business banking apps for small merchants in Nigeria?',
      category: 'Business banking',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 50 * msInDay).toISOString(),
      lastRunAt: new Date(now - 2 * msInDay).toISOString(),
      nextRunAt: new Date(now + 5 * msInDay).toISOString(),
    },
    {
      id: 'demo_q_pos',
      text: 'Which fintech offers the most reliable POS terminal in Nigeria?',
      category: 'Point of Sale',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 45 * msInDay).toISOString(),
      lastRunAt: new Date(now - 4 * msInDay).toISOString(),
      nextRunAt: new Date(now + 3 * msInDay).toISOString(),
    },
    {
      id: 'demo_q_shopify',
      text: 'How to collect online payments on a Shopify store in Nigeria?',
      category: 'E-commerce',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 40 * msInDay).toISOString(),
      lastRunAt: new Date(now - 3 * msInDay).toISOString(),
      nextRunAt: new Date(now + 4 * msInDay).toISOString(),
    },
    {
      id: 'demo_q_loans',
      text: 'What are the best platforms to get business loans for small businesses in Nigeria?',
      category: 'Funding',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 35 * msInDay).toISOString(),
      lastRunAt: new Date(now - 5 * msInDay).toISOString(),
      nextRunAt: new Date(now + 2 * msInDay).toISOString(),
    },
    {
      id: 'demo_q_fees',
      text: 'Which payment solution has the lowest transaction fees in Lagos?',
      category: 'Fees',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 30 * msInDay).toISOString(),
      lastRunAt: new Date(now - 1 * msInDay).toISOString(),
      nextRunAt: new Date(now + 6 * msInDay).toISOString(),
    },
    {
      id: 'demo_q_security',
      text: 'What is the most secure payment gateway for mobile apps in West Africa?',
      category: 'Security',
      frequency: 'weekly' as const,
      active: true,
      isSample: true,
      createdAt: new Date(now - 25 * msInDay).toISOString(),
      lastRunAt: new Date(now - 2 * msInDay).toISOString(),
      nextRunAt: new Date(now + 5 * msInDay).toISOString(),
    },
  ];

  for (const q of queries) {
    await adminDb.doc(`workspaces/${wid}/queries/${q.id}`).set(q);
  }

  // 3. Nigerian Tech Sources
  const sourcePool = [
    {
      title: 'Top Payment Gateways in Nigeria (2026)',
      url: 'https://techcabal.com/guides/payment-gateways-nigeria',
      domain: 'techcabal.com',
    },
    {
      title: 'Moniepoint and Flutterwave battle for offline retail banking dominance',
      url: 'https://techpoint.africa/pos-terminal-reliability-nigeria',
      domain: 'techpoint.africa',
    },
    {
      title: 'Paystack checkout metrics and merchant analytics overview',
      url: 'https://benjamindada.com/paystack-checkout-success-rates',
      domain: 'benjamindada.com',
    },
    {
      title: 'Fintech evolution and merchant credit pathways in West Africa',
      url: 'https://punchng.com/fintech-evolution-merchant-credit-nigeria',
      domain: 'punchng.com',
    },
  ];

  const answerTemplates = [
    (qText: string) =>
      `When searching for "${qText}", top recommended payment solutions in Nigeria focus on developer experience and merchant reliability. Paystack (@paystack) is frequently named first for its clean API docs and seamless customer checkout flows. Flutterwave (@flutterwave) is also highlighted for global multi-currency support, while Moniepoint (@moniepoint) is mentioned for physical POS and agent business banking.`,
    (qText: string) =>
      `Regarding "${qText}", highly recommended brands include Paystack (@paystack) and Flutterwave (@flutterwave). Both offer virtual account generation and card checkout routes. Paystack stands out for customizable recurring debit options, while Flutterwave shares localized payout pathways. Moniepoint is noted for fast merchant onboarding.`,
    (qText: string) =>
      `For business builders asking "${qText}", major African tech media like TechCabal point to Moniepoint (@moniepoint) and Paystack (@paystack). Moniepoint provides robust offline banking. Paystack is praised for instant digital settlements and transparent developer onboarding dashboards.`,
    (qText: string) =>
      `In response to "${qText}", Paystack (@paystack) ranks among the top choices for consistent transaction success rates and helpful merchant email support. Moniepoint and Flutterwave are also frequently cited options for digital payment integrations.`,
  ];

  let runCount = 0;
  // Generate runs across 56 days (about 8 weeks)
  for (let dayOffset = 55; dayOffset >= 0; dayOffset -= 1.3) {
    const runDate = new Date(now - Math.floor(dayOffset * msInDay) - Math.floor(Math.random() * 3600000 * 12));
    const query = queries[Math.floor(Math.random() * queries.length)];
    const templateIndex = Math.floor(Math.random() * answerTemplates.length);
    const answerText = answerTemplates[templateIndex](query.text);

    let mentions: { brandId: string; brandName: string; position: number }[] = [];
    if (templateIndex === 0) {
      mentions = [
        { brandId: 'demo_b_paystack', brandName: 'Paystack', position: 1 },
        { brandId: 'demo_b_flutterwave', brandName: 'Flutterwave', position: 2 },
        { brandId: 'demo_b_moniepoint', brandName: 'Moniepoint', position: 3 },
      ];
    } else if (templateIndex === 1) {
      mentions = [
        { brandId: 'demo_b_paystack', brandName: 'Paystack', position: 1 },
        { brandId: 'demo_b_flutterwave', brandName: 'Flutterwave', position: 2 },
        { brandId: 'demo_b_moniepoint', brandName: 'Moniepoint', position: 3 },
      ];
    } else if (templateIndex === 2) {
      mentions = [
        { brandId: 'demo_b_moniepoint', brandName: 'Moniepoint', position: 1 },
        { brandId: 'demo_b_paystack', brandName: 'Paystack', position: 2 },
        { brandId: 'demo_b_flutterwave', brandName: 'Flutterwave', position: 3 },
      ];
    } else {
      mentions = [
        { brandId: 'demo_b_paystack', brandName: 'Paystack', position: 1 },
        { brandId: 'demo_b_moniepoint', brandName: 'Moniepoint', position: 2 },
        { brandId: 'demo_b_flutterwave', brandName: 'Flutterwave', position: 3 },
      ];
    }

    const sources = [
      sourcePool[Math.floor(Math.random() * sourcePool.length)],
      sourcePool[Math.floor(Math.random() * sourcePool.length)],
    ].filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i);

    const runDocRef = adminDb.collection(`workspaces/${wid}/runs`).doc();
    const rid = runDocRef.id;
    await runDocRef.set({
      id: rid,
      queryId: query.id,
      queryText: query.text,
      model: GEMINI_MODEL,
      status: 'completed',
      startedAt: runDate.toISOString(),
      answerText,
      mentions,
      sources,
      isSample: true,
    });
    runCount++;
  }

  // 4. Sample Weekly Reports with Nigerian Brands
  const reports = [
    {
      id: 'demo_rep_week_1',
      periodStart: new Date(now - 7 * msInDay).toISOString(),
      periodEnd: new Date(now).toISOString(),
      visibilityScore: 83,
      avgPosition: 1.2,
      shareOfVoice: [
        {
          brandId: 'demo_b_paystack',
          brandName: 'Paystack',
          kind: 'own' as const,
          mentionCount: 10,
          sharePercentage: 48,
          avgPosition: 1.2,
        },
        {
          brandId: 'demo_b_flutterwave',
          brandName: 'Flutterwave',
          kind: 'competitor' as const,
          mentionCount: 7,
          sharePercentage: 34,
          avgPosition: 2.0,
        },
        {
          brandId: 'demo_b_moniepoint',
          brandName: 'Moniepoint',
          kind: 'competitor' as const,
          mentionCount: 4,
          sharePercentage: 18,
          avgPosition: 2.8,
        },
      ],
      topSources: [
        { domain: 'techcabal.com', citationCount: 8 },
        { domain: 'techpoint.africa', citationCount: 6 },
        { domain: 'benjamindada.com', citationCount: 5 },
      ],
      runCount: 12,
      generatedAt: new Date(now - 1 * msInDay).toISOString(),
      isSample: true,
    },
    {
      id: 'demo_rep_week_2',
      periodStart: new Date(now - 14 * msInDay).toISOString(),
      periodEnd: new Date(now - 7 * msInDay).toISOString(),
      visibilityScore: 75,
      avgPosition: 1.5,
      shareOfVoice: [
        {
          brandId: 'demo_b_paystack',
          brandName: 'Paystack',
          kind: 'own' as const,
          mentionCount: 8,
          sharePercentage: 44,
          avgPosition: 1.5,
        },
        {
          brandId: 'demo_b_flutterwave',
          brandName: 'Flutterwave',
          kind: 'competitor' as const,
          mentionCount: 7,
          sharePercentage: 38,
          avgPosition: 1.8,
        },
        {
          brandId: 'demo_b_moniepoint',
          brandName: 'Moniepoint',
          kind: 'competitor' as const,
          mentionCount: 3,
          sharePercentage: 18,
          avgPosition: 2.7,
        },
      ],
      topSources: [
        { domain: 'techpoint.africa', citationCount: 6 },
        { domain: 'techcabal.com', citationCount: 5 },
      ],
      runCount: 11,
      generatedAt: new Date(now - 8 * msInDay).toISOString(),
      isSample: true,
    },
  ];

  for (const rep of reports) {
    await adminDb.doc(`workspaces/${wid}/reports/${rep.id}`).set(rep);
  }

  return {
    brandCount: brands.length,
    queryCount: queries.length,
    runCount,
    reportCount: reports.length,
  };
}

export async function clearDemoData(wid: string): Promise<{ deletedCount: number }> {
  let deletedCount = 0;
  const collections = ['brands', 'queries', 'runs', 'reports'];

  for (const col of collections) {
    const snap = await adminDb
      .collection(`workspaces/${wid}/${col}`)
      .where('isSample', '==', true)
      .get();

    for (const doc of snap.docs) {
      await doc.ref.delete();
      deletedCount++;
    }
  }

  return { deletedCount };
}
