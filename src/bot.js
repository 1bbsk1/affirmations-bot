import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const dailyCron = process.env.DAILY_CRON || '0 9 * * *'; // 09:00 daily, server time
const webhookDomain = process.env.WEBHOOK_DOMAIN; // e.g. https://your-app.fly.dev
const webhookPath = process.env.WEBHOOK_PATH || '/tg-bot';
const port = Number(process.env.PORT) || 3000;

if (!token) {
  console.error('Missing TELEGRAM_TOKEN. Set it in your environment or .env file.');
  process.exit(1);
}

const affirmations = [
  'I have everything I need to succeed.',
  'I am calm, strong, and resilient.',
  'I trust myself to make good decisions.',
  'I deserve good things and new opportunities.',
  'I learn and grow from every experience.',
  'I choose progress over perfection.',
  'I am capable, creative, and confident.',
  'I handle challenges with grace and clarity.',
  'I am grateful for the wins, big and small.',
  'I bring value to the people around me.',
];

const subscribers = new Set();

const bot = new Telegraf(token);

const randomAffirmation = () => affirmations[Math.floor(Math.random() * affirmations.length)];

const todayAffirmation = () => {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % affirmations.length;
  return affirmations[dayIndex];
};

const sendAffirmation = async (chatId, text) => {
  try {
    await bot.telegram.sendMessage(chatId, text);
  } catch (err) {
    console.error(`Failed to send to ${chatId}:`, err.message);
  }
};

bot.start(async (ctx) => {
  subscribers.add(ctx.chat.id);
  const lines = [
    'Hi! I will send you daily affirmations.',
    'Use /affirm for a random one, /today for today\'s pick.',
    'You are subscribed to daily drops. Use /stop to opt out.',
    `Daily schedule: ${dailyCron} (cron expression, server time).`,
  ];
  await ctx.reply(lines.join('\n'));
});

bot.command('affirm', (ctx) => ctx.reply(randomAffirmation()));

bot.command('today', (ctx) => ctx.reply(todayAffirmation()));

bot.command('subscribe', (ctx) => {
  subscribers.add(ctx.chat.id);
  return ctx.reply('Subscribed. You will get daily affirmations.');
});

bot.command('stop', (ctx) => {
  subscribers.delete(ctx.chat.id);
  return ctx.reply('Unsubscribed. Come back anytime.');
});

cron.schedule(dailyCron, () => {
  const message = `Daily affirmation: ${todayAffirmation()}`;
  console.log(`Sending daily affirmation to ${subscribers.size} chat(s).`);
  subscribers.forEach((chatId) => {
    sendAffirmation(chatId, message);
  });
});

const launch = async () => {
  if (webhookDomain) {
    await bot.launch({
      webhook: {
        domain: webhookDomain,
        hookPath: webhookPath,
        port,
      },
    });
    console.log(`Bot is running via webhook at ${webhookDomain}${webhookPath} on port ${port}.`);
  } else {
    await bot.launch();
    console.log('Bot is running in polling mode (set WEBHOOK_DOMAIN to switch to webhooks).');
  }
};

launch()
  .catch((err) => {
    console.error('Failed to launch bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
