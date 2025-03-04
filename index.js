const fetchNewRelicLogs = require("./src/fetchNewRelicLogs");
const sendDiscordWebhook = require("./src/sendDiscordWebhook");
const scheduledLogJob = require("./src/scheduledLogJob");

async function main() {
  console.log("Fetching logs from New Relic...");
  const logs = await fetchNewRelicLogs();

  console.log(`Fetched ${logs.length} logs. Sending to Discord...`);
  await sendDiscordWebhook(logs);

  console.log("Immediate New Relic error log check completed.");

  console.log("Scheduled the New Relic log job...");
  scheduledLogJob();
}

main().catch(console.error);
