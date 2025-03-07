# New Relic Discord Webhook

A Node.js project to fetch logs from New Relic and send them to a Discord webhook.

## Description
This project provides a simple way to integrate New Relic logs with Discord, allowing you to receive notifications and updates on errors and other important events of your choosing.

## Use Cases
- Receive notifications on errors and exceptions in your application.
- Monitor performance and latency issues in your application.
- Integrate with your existing Discord channels for centralized logging and monitoring.

## Instructions

### Prerequisites
- Node.js (version 20 or higher)
- New Relic account with API key and NerdGraph query
- Discord Webhook URL

### Setup
1. Clone this repository and install dependencies by using the `npm install` command in your terminal.
2. Copy the `config-example.json` file and rename it to `config.json`.

```json
{
  "NEWRELIC_QUERY_KEY": "your_new_relic_api_key",
  "NEWRELIC_NERDGRAPH_QUERY": "your_new_relic_nerdgraph_query",
  "DISCORD_WEBHOOK_URL": "your_discord_webhook_url",
  "CRON_SCHEDULE": "your_cron_job_schedule"
}
```
<br>

> [!IMPORTANT]
Replace the placeholders in the `config.json` file with your actual values.

## Running the Script
1. Run the script using `node index.js` or `npm start` command.
2. The script will fetch logs from New Relic and send them to the Discord webhook.

### Scheduling
- To schedule the script to run at regular intervals you can modify the `CRON_SCHEDULE` in config.json to suit your scheduling needs.

> [!NOTE]
Use [crontab.guru](https://crontab.guru/) to find the right Cron Job schedule that works for you.

---
<br>

> I hope this helps! Let me know if you have any questions or need further assistance.