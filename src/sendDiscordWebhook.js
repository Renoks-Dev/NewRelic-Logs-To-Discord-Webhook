const config = require("../config.json");

const { DISCORD_WEBHOOK_URL } = config;

if (!DISCORD_WEBHOOK_URL) {
  throw new Error("Missing DISCORD_WEBHOOK_URL in config.json.");
}

async function sendDiscordWebhook(logs, scheduledFetch = false) {
  if (!Array.isArray(logs)) {
    console.error(
      "Logs object is not an array. Sending to discord webhook aborted."
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
    embeds = logs.map((log) => ({
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
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs to Discord: ${response.statusText}`);
    }

    console.log("Logs sent to Discord successfully.");
  } catch (error) {
    console.error("Error sending logs to Discord:", error);
  }
}

module.exports = sendDiscordWebhook;
