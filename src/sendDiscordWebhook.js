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

  if (logs.length === 0) {
    console.log("No error logs to send.");

    embeds.push({
      title: "✅ Log Activity Not Found",
      description: "No log entries are available at this time.",
      color: 3066993,
      timestamp: new Date().toISOString(),
    });
  } else {
    const validLogs = logs.filter((log, index) => {
      const hasTimestamp = log.timestamp || log.original_timestamp;

      if (!hasTimestamp) {
        console.warn(
          `Skipping log at index ${index} due to missing timestamp.`
        );
        return false;
      }
      return true;
    });

    if (validLogs.length === 0) {
      console.warn("No valid logs available after validation.");
      return;
    }

    console.log(`Total of ${validLogs.length} valid logs will be processed.`);

    // Sort the valid logs by timestamp ascending (oldest first, newest last)
    validLogs.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.original_timestamp).getTime();
      const timeB = new Date(b.timestamp || b.original_timestamp).getTime();
      return timeA - timeB;
    });

    embeds = validLogs.map((log) => ({
      title: `🚨 New Relic ${log.level?.toUpperCase() || "UNKNOWN"} Log 🚨`,
      description: log.message
        ? `\`\`\`${log.message}\`\`\``
        : "No message available.",
      fields: [
        {
          name: "Hostname",
          value: log.hostname
            ? `\`\`\`${log.hostname}\`\`\``
            : `\`\`\`Unknown\`\`\``,
          inline: false,
        },
        {
          name: "Project Name",
          value: log["entity.name"]
            ? `\`\`\`${log["entity.name"]}\`\`\``
            : `\`\`\`Unknown\`\`\``,
          inline: false,
        },
        {
          name: "Level",
          value: log.level ? `\`\`\`${log.level}\`\`\`` : `\`\`\`Unknown\`\`\``,
          inline: false,
        },
        {
          name: "Stack",
          value: log.stack ? `\`\`\`${log.stack}\`\`\`` : `\`\`\`Unknown\`\`\``,
          inline: false,
        },
        {
          name: "Timestamp UTC",
          value: log.original_timestamp
            ? `\`\`\`${log.original_timestamp}\`\`\``
            : `\`\`\`Unknown\`\`\``,
          inline: false,
        },
      ],
      ...(log.timestamp && {
        timestamp: new Date(log.timestamp).toISOString(),
      }),
      color: log.level === "error" ? 16711680 : 16744448,
      footer: scheduledFetch
        ? { text: "🔁 Scheduled Execution 🔁" }
        : { text: "🚀 Immediate Execution 🚀" },
    }));
  }

  try {
    const batchSize = 10; // Discord accepts maximum of 10 embeds per request

    for (let i = 0; i < embeds.length; i += batchSize) {
      const batch = embeds.slice(i, i + batchSize);

      console.log(
        `Sending batch ${Math.floor(i / batchSize) + 1}/${totalBatches} with ${
          batch.length
        } embeds.`
      );

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: batch }),
      });

      if (!response.ok) {
        console.error(
          `Failed to send Batch ${i / batchSize + 1} logs to Discord: ${
            response.statusText
          }`
        );
      } else {
        console.log(
          `Batch ${
            i / batchSize + 1
          } of logs sent to Discord Webhook successfully.`
        );
      }
    }
  } catch (error) {
    console.error("Error sending logs to Discord:", error);
  }
}

module.exports = sendDiscordWebhook;
