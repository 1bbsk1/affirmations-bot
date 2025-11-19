# Telegram Affirmations Bot (Node/Telegraf)

Fast MVP Telegram bot that serves affirmations on demand and on a daily schedule using Telegraf + node-cron.

## Quick start
1. Install dependencies: `npm install`
2. Add env vars (`TELEGRAM_TOKEN` is required):
   ```bash
   cp .env.example .env  # optional helper
   # then edit .env to set your bot token
   ```
3. Start the bot: `npm start`
4. Talk to your bot in Telegram. Commands:
   - `/start` subscribes you and shows help
   - `/affirm` random affirmation
   - `/today` deterministic daily pick
   - `/subscribe` opt in if you unsubscribed
   - `/stop` unsubscribe

## Configuration
- `TELEGRAM_TOKEN` (required) – bot token from BotFather.
- `DAILY_CRON` (optional) – cron string for daily send. Defaults to `0 9 * * *` (09:00 server time).
- `WEBHOOK_DOMAIN` (optional) – set to enable webhooks, e.g. `https://your-app.fly.dev`. If omitted, bot uses polling.
- `WEBHOOK_PATH` (optional) – webhook path, default `/tg-bot`.
- `PORT` (optional) – port for the webhook server, default `3000`.

## Notes
- Subscribers are tracked in memory; a restart loses the list. For persistence, swap the `Set` for a file/DB.
- Set `WEBHOOK_DOMAIN` to switch to webhook mode (preferred for hosting). Leaving it empty keeps polling (simpler for local/dev).
