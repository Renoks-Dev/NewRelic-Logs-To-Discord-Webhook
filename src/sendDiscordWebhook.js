const { sendWebhookBatch } = require("./utils/sendWebhookBatch");
const { formatLogEmbeds, validateLogs } = require("./utils/logUtils");
const config = require("../config.json");
const { DISCORD_WEBHOOK_URL } = config;

if (!DISCORD_WEBHOOK_URL) {
  throw new Error("Missing DISCORD_WEBHOOK_URL in config.json.");
}

async function sendDiscordWebhook(logs, scheduledFetch = false) {
  if (!Array.isArray(logs)) {
    console.error(
      "Logs object is not an array. Sending to Discord webhook aborted."
    );
    return;
  }

  let embeds = [];

  console.log(`Total of ${logs.length} logs will be processed.`);

  if (logs.length === 0) {
    console.log("No error logs to send.");

    embeds.push({
      title: "✅ Log Activity Not Found",
      description: "No log entries are available at this time.",
      color: 3066993,
      timestamp: new Date().toISOString(),
    });
  } else {
    const validLogs = validateLogs(logs);

    if (validLogs.length === 0) {
      console.warn("No valid logs available after validation.");

      embeds.push({
        title: "✅ Log Activity Not Found",
        description: "No valid logs were found after validation.",
        color: 3066993,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`Total of ${validLogs.length} valid logs will be processed.`);
      embeds = formatLogEmbeds(validLogs, scheduledFetch);
    }
  }

  try {
    await sendWebhookBatch(embeds, DISCORD_WEBHOOK_URL);
  } catch (error) {
    console.error("Error sending logs to Discord:", error);
  }
}

module.exports = sendDiscordWebhook;
