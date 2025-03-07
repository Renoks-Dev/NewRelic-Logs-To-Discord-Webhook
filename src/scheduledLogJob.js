const cron = require("node-cron");
const config = require("../config.json");
const fetchNewRelicLogs = require("./fetchNewRelicLogs");
const sendDiscordWebhook = require("./sendDiscordWebhook");

const { CRON_SCHEDULE } = config;

if (!CRON_SCHEDULE) {
  console.warn(
    "CRON_SCHEDULE is not set in config.json file. Skipping scheduled log job."
  );
}

function scheduledLogJob() {
  cron.schedule(
    CRON_SCHEDULE,
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
