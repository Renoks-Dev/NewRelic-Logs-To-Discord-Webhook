const cron = require("node-cron");
const fetchNewRelicLogs = require("./fetchNewRelicLogs");
const sendDiscordWebhook = require("./sendDiscordWebhook");

function scheduledLogJob() {
  cron.schedule(
    "0 17 * * *",
    async () => {
      console.log("Scheduled New Relic error log check started...");

      const logs = await fetchNewRelicLogs();
      await sendDiscordWebhook(logs, true);

      console.log("Scheduled New Relic error log check completed.");
    },
    { timezone: "UTC" }
  );
}

module.exports = scheduledLogJob;
