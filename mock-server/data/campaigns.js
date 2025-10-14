import { faker } from '@faker-js/faker';

const FAKER_SEED = 20240715;
const TOTAL_GENERATED = 240;
const BASE_REFERENCE_DATE = new Date('2025-10-15T12:00:00Z');

faker.seed(FAKER_SEED);

const toIsoString = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  const candidate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(candidate.getTime()) ? null : candidate.toISOString();
};

const buildCampaignLinks = (id) => {
  const basePath = `/api/3/campaigns/${id}`;
  return {
    bounceLogs: `${basePath}/bounceLogs`,
    contactAutomations: `${basePath}/contactAutomations`,
    contactData: `${basePath}/contactData`,
    contactGoals: `${basePath}/contactGoals`,
    contactLists: `${basePath}/contactLists`,
    contactLogs: `${basePath}/contactLogs`,
    contactTags: `${basePath}/contactTags`,
    contactDeals: `${basePath}/contactDeals`,
    deals: `${basePath}/deals`,
    fieldValues: `${basePath}/fieldValues`,
    geoIps: `${basePath}/geoIps`,
    notes: `${basePath}/notes`,
    organization: `${basePath}/organization`,
    plusAppend: `${basePath}/plusAppend`,
    trackingLogs: `${basePath}/trackingLogs`,
    scoreValues: `${basePath}/scoreValues`,
  };
};

const createSpecCampaign = ({
  id,
  name,
  type,
  status,
  sdate,
  ldate,
  cdate,
  mdate,
  emailsSent,
  opens,
  clicks,
  bounces,
  unsubscribes,
}) => {
  const campaignId = String(id);
  const sendDate = toIsoString(sdate);
  const lastSendDate = toIsoString(ldate) ?? sendDate;
  const createdAt =
    toIsoString(cdate) ??
    toIsoString(faker.date.recent({ days: 120, refDate: sendDate ?? BASE_REFERENCE_DATE }));
  const updatedAt =
    toIsoString(mdate) ??
    toIsoString(faker.date.soon({ days: 5, refDate: lastSendDate ?? createdAt }));

  const totalEmails = Math.max(emailsSent ?? 0, 0);
  const totalOpens = Math.max(opens ?? faker.number.int({ min: Math.floor(totalEmails * 0.2), max: totalEmails || 1 }), 0);
  const totalClicks = Math.max(
    clicks ?? faker.number.int({ min: Math.floor(totalOpens * 0.1), max: totalOpens || 1 }),
    0,
  );
  const totalBounces = Math.max(bounces ?? faker.number.int({ min: 0, max: Math.floor(totalEmails * 0.05) }), 0);
  const totalUnsubscribes = Math.max(
    unsubscribes ?? faker.number.int({ min: 0, max: Math.floor(totalEmails * 0.02) }),
    0,
  );

  const uniqueOpens = Math.min(
    totalOpens,
    Math.max(Math.floor(totalOpens * faker.number.float({ min: 0.7, max: 0.95 })), 0),
  );
  const uniqueClicks = Math.min(
    totalClicks,
    Math.max(Math.floor(totalClicks * faker.number.float({ min: 0.6, max: 0.9 })), 0),
  );
  const softBounces = Math.min(
    totalBounces,
    Math.max(Math.floor(totalBounces * faker.number.float({ min: 0.2, max: 0.6 })), 0),
  );
  const subscriberClicks = Math.min(
    totalClicks,
    Math.max(Math.floor(totalClicks * faker.number.float({ min: 0.5, max: 0.85 })), 0),
  );
  const forwardsTotal = Math.max(
    faker.number.int({
      min: 0,
      max: Math.max(Math.floor(totalEmails * 0.01), 5),
    }),
    0,
  );
  const uniqueForwards = Math.min(
    forwardsTotal,
    faker.number.int({ min: 0, max: forwardsTotal }),
  );
  const repliesTotal = Math.max(
    faker.number.int({
      min: 0,
      max: Math.max(Math.floor(totalOpens * 0.05), 10),
    }),
    0,
  );
  const uniqueReplies = Math.min(
    repliesTotal,
    faker.number.int({ min: 0, max: repliesTotal }),
  );

  const randomId = () => String(faker.number.int({ min: 1, max: 999999 }));
  const booleanString = () => (faker.datatype.boolean() ? '1' : '0');
  const randomChoice = (choices) => faker.helpers.arrayElement(choices);
  const randomNullableString = (generator, chance = 0.5) =>
    faker.datatype.boolean({ probability: chance }) ? generator() : null;
  const randomPositiveIntString = (max) =>
    String(faker.number.int({ min: 0, max }));
  const randomOffsetType = () =>
    randomChoice(['before', 'after', '', 'relative']);
  const randomSplitType = () => randomChoice(['', 'subject', 'content', 'send_time']);
  const randomResponderType = () =>
    randomChoice(['', 'responder', 'reminder', 'rss']);

  return {
    type,
    userid: randomId(),
    segmentid: randomId(),
    bounceid: randomId(),
    realcid: randomId(),
    sendid: randomId(),
    threadid: randomId(),
    seriesid: type === 'automation' ? randomId() : '0',
    formid: randomId(),
    basetemplateid: randomId(),
    basemessageid: randomId(),
    addressid: randomId(),
    source: 'api',
    name,
    cdate: createdAt ?? toIsoString(BASE_REFERENCE_DATE),
    mdate: updatedAt ?? createdAt ?? toIsoString(BASE_REFERENCE_DATE),
    sdate: sendDate,
    ldate: lastSendDate,
    send_amt: String(totalEmails),
    total_amt: String(totalEmails),
    opens: String(totalOpens),
    uniqueopens: String(uniqueOpens),
    linkclicks: String(totalClicks),
    uniquelinkclicks: String(uniqueClicks),
    subscriberclicks: String(subscriberClicks),
    forwards: String(Math.min(forwardsTotal, totalEmails)),
    uniqueforwards: String(uniqueForwards),
    hardbounces: String(totalBounces),
    softbounces: String(softBounces),
    unsubscribes: String(totalUnsubscribes),
    unsubreasons: randomChoice(['', 'Spam complaint', 'Content not relevant', 'Too frequent']),
    updates: randomPositiveIntString(Math.max(Math.floor(totalEmails * 0.005), 1)),
    socialshares: randomPositiveIntString(50),
    replies: String(repliesTotal),
    uniquereplies: String(uniqueReplies),
    status,
    public: booleanString(),
    mail_transfer: randomChoice(['queued', 'processing', 'completed']),
    mail_send: randomChoice(['queued', 'processing', 'completed']),
    mail_cleanup: randomChoice(['pending', 'processing', 'completed']),
    mailer_log_file: faker.system.fileName(),
    tracklinks: randomChoice(['all', 'none', 'htmlonly']),
    tracklinksanalytics: randomChoice(['all', 'none']),
    trackreads: booleanString(),
    trackreadsanalytics: booleanString(),
    analytics_campaign_name: faker.helpers.slugify(name).toLowerCase(),
    tweet: randomPositiveIntString(20),
    facebook: randomPositiveIntString(50),
    survey: randomPositiveIntString(10),
    embed_images: booleanString(),
    htmlunsub: booleanString(),
    textunsub: booleanString(),
    htmlunsubdata: randomNullableString(() => faker.lorem.paragraph(1), 0.2),
    textunsubdata: randomNullableString(() => faker.lorem.sentence(), 0.2),
    recurring: booleanString(),
    willrecur: booleanString(),
    split_type: randomSplitType(),
    split_content: randomChoice(['', 'subject', 'from', 'content']),
    split_offset: randomPositiveIntString(60),
    split_offset_type: randomOffsetType(),
    split_winner_messageid: randomId(),
    split_winner_awaiting: booleanString(),
    responder_offset: randomPositiveIntString(30),
    responder_type: randomResponderType(),
    responder_existing: booleanString(),
    reminder_field: randomChoice(['', 'startdate', 'duedate', 'custom']),
    reminder_format: randomNullableString(() => randomChoice(['html', 'text', 'both']), 0.4),
    reminder_type: randomChoice(['', 'email', 'sms', 'push']),
    reminder_offset: randomPositiveIntString(14),
    reminder_offset_type: randomOffsetType(),
    reminder_offset_sign: randomChoice(['+', '-']),
    reminder_last_cron_run: randomNullableString(() =>
      toIsoString(faker.date.recent({ days: 14, refDate: updatedAt ?? BASE_REFERENCE_DATE })),
    ),
    activerss_interval: randomPositiveIntString(48),
    activerss_url: randomNullableString(() => faker.internet.url(), 0.3),
    activerss_items: randomPositiveIntString(25),
    ip4: faker.internet.ipv4(),
    laststep: randomPositiveIntString(20),
    managetext: booleanString(),
    schedule: randomChoice(['0', '1']),
    scheduleddate: randomNullableString(() =>
      toIsoString(faker.date.soon({ days: 7, refDate: sendDate ?? BASE_REFERENCE_DATE })),
    ),
    waitpreview: booleanString(),
    deletestamp: randomNullableString(() =>
      toIsoString(faker.date.past({ years: 1, refDate: sendDate ?? BASE_REFERENCE_DATE })),
    ),
    replysys: booleanString(),
    links: buildCampaignLinks(campaignId),
    id: campaignId,
    user: randomId(),
    automation: type === 'automation' ? campaignId : null,
  };
};

const generatedCampaign = (index) => {
  const shouldBeRecent = faker.datatype.boolean({ probability: 0.1 });
  const recencyWindow = shouldBeRecent ? 28 : 1000;
  const sendDate = faker.date.recent({ days: recencyWindow, refDate: BASE_REFERENCE_DATE });
  const lastSendDate = faker.date.soon({ days: 3, refDate: sendDate });
  const type = faker.helpers.arrayElement(['single', 'automation', 'split']);
  const status = faker.helpers.arrayElement(['sent', 'scheduled', 'draft']);

  const emailsSent = faker.number.int({ min: 400, max: 12000 });
  const opens = faker.number.int({ min: Math.floor(emailsSent * 0.3), max: emailsSent });
  const clicks = faker.number.int({ min: Math.floor(opens * 0.2), max: opens });
  const bounces = faker.number.int({ min: 0, max: Math.floor(emailsSent * 0.06) });
  const unsubscribes = faker.number.int({ min: 0, max: Math.floor(emailsSent * 0.03) });

  return createSpecCampaign({
    id: 1000 + index,
    name: faker.company.buzzPhrase(),
    type,
    status,
    sdate: sendDate,
    ldate: lastSendDate,
    emailsSent,
    opens,
    clicks,
    bounces,
    unsubscribes,
  });
};

const generatedCampaigns = Array.from({ length: TOTAL_GENERATED }, (_value, index) =>
  generatedCampaign(index),
);

export default [...generatedCampaigns];
