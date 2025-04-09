function validateLogs(logs) {
  return logs.filter((log, index) => {
    const hasTimestamp = log.timestamp || log.original_timestamp;
    if (!hasTimestamp) {
      console.warn(`Skipping log at index ${index} due to missing timestamp.`);
      return false;
    }
    return true;
  });
}

function formatLogEmbeds(validLogs, scheduledFetch) {
  // Sort the valid logs by timestamp ascending (oldest first, newest last)
  validLogs.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.original_timestamp).getTime();
    const timeB = new Date(b.timestamp || b.original_timestamp).getTime();
    return timeA - timeB;
  });

  return validLogs.map((log) => ({
    title: `🚨 New Relic ${log.level?.toUpperCase() || "UNKNOWN"} Log 🚨`,
    description: log.message
      ? `\`\`\`${log.message}\`\`\``
      : "No message available.",
    fields: [
      {
        name: "Hostname",
        value: log.hostname ? `\`\`\`${log.hostname}\`\`\`` : "`Unknown`",
        inline: false,
      },
      {
        name: "Project Name",
        value: log["entity.name"]
          ? `\`\`\`${log["entity.name"]}\`\`\``
          : "`Unknown`",
        inline: false,
      },
      {
        name: "Level",
        value: log.level ? `\`\`\`${log.level}\`\`\`` : "`Unknown`",
        inline: false,
      },
      {
        name: "Stack",
        value: log.stack ? `\`\`\`${log.stack}\`\`\`` : "`Unknown`",
        inline: false,
      },
      {
        name: "Timestamp UTC",
        value: log.original_timestamp
          ? `\`\`\`${log.original_timestamp}\`\`\``
          : "`Unknown`",
        inline: false,
      },
    ],
    ...(log.timestamp && { timestamp: new Date(log.timestamp).toISOString() }),
    color: log.level === "error" ? 16711680 : 16744448,
    footer: scheduledFetch
      ? { text: "🔁 Scheduled Execution 🔁" }
      : { text: "🚀 Immediate Execution 🚀" },
  }));
}

module.exports = { validateLogs, formatLogEmbeds };
