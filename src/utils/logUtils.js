const MAX_FIELD_TITLE_CHARACTER_LENGTH = 256;
const MAX_FIELD_VALUE_CHARACTER_LENGTH = 1024 / 3.5;
const MAX_EMBED_CHARACTER_SIZE = 6000;
const MAX_EMBED_DESCRIPTION_LENGTH = 2048;

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

  let embeds = validLogs.map((log) => {
    const truncatedTitle = truncateString(
      `🚨 New Relic ${log.level?.toUpperCase() || "UNKNOWN"} Log 🚨`,
      MAX_FIELD_TITLE_CHARACTER_LENGTH
    );

    const truncatedMessage = truncateString(
      `\`\`\`${log.message || "No message available."}\`\`\``,
      MAX_FIELD_VALUE_CHARACTER_LENGTH
    );

    const truncatedHostname = truncateString(
      `\`\`\`${log.hostname || "Unknown"}\`\`\``,
      MAX_FIELD_VALUE_CHARACTER_LENGTH
    );

    const truncatedProjectName = truncateString(
      `\`\`\`${log["entity.name"] || "Unknown"}\`\`\``,
      MAX_FIELD_VALUE_CHARACTER_LENGTH
    );

    const truncatedStack = truncateString(
      `\`\`\`${log.stack || "Unknown"}\`\`\``,
      MAX_FIELD_VALUE_CHARACTER_LENGTH
    );

    const truncatedTimestamp = truncateString(
      `\`\`\`${log.original_timestamp || "Unknown"}\`\`\``,
      MAX_FIELD_VALUE_CHARACTER_LENGTH
    );

    // Max Embed Field number is 25
    const embedFields = [
      { name: "Hostname", value: truncatedHostname, inline: false },
      { name: "Project Name", value: truncatedProjectName, inline: false },
      {
        name: "Level",
        value: `\`\`\`${log.level?.toUpperCase()}\`\`\`` || "Unknown",
        inline: false,
      },
      { name: "Stack", value: truncatedStack, inline: false },
      { name: "Timestamp UTC", value: truncatedTimestamp, inline: false },
    ];

    const embed = {
      title: truncatedTitle,
      description: truncateString(
        truncatedMessage,
        MAX_EMBED_DESCRIPTION_LENGTH
      ),
      fields: embedFields,
      color: log.level === "error" ? 16711680 : 16744448,
      footer: scheduledFetch
        ? { text: "🔁 Scheduled Execution 🔁" }
        : { text: "🚀 Immediate Execution 🚀" },
      ...(log.timestamp && {
        timestamp: new Date(log.timestamp).toISOString(),
      }),
    };

    return embed;
  });

  embeds = splitEmbedsIfNeeded(embeds);

  return embeds;
}

function truncateString(str, maxLength) {
  const hasCodeBlock = str.startsWith("```") && str.endsWith("```");

  let rawStr = hasCodeBlock ? str.slice(3, -3) : str;

  if (rawStr.length > maxLength) {
    const truncatedRaw = rawStr.substring(0, maxLength - 9) + "...";
    return hasCodeBlock ? "```" + truncatedRaw + "```" : truncatedRaw;
  }

  return str;
}

function splitEmbedsIfNeeded(embeds) {
  let newEmbeds = [];

  for (const embed of embeds) {
    let currentEmbed = { ...embed };
    let totalSize = calculateEmbedSize(currentEmbed);

    if (totalSize > MAX_EMBED_CHARACTER_SIZE) {
      const fields = embed.fields;
      let fieldBatch = [];
      let currentBatchSize = 0;

      fields.forEach((field) => {
        const fieldSize = calculateFieldSize(field);

        if (currentBatchSize + fieldSize > MAX_EMBED_CHARACTER_SIZE) {
          // Push the current batch as an embed, then reset for the next batch
          newEmbeds.push({ ...currentEmbed, fields: fieldBatch });
          currentBatchSize = fieldSize; // New batch starts with the current field
          fieldBatch = [field];
        } else {
          // Add the field to the current batch
          fieldBatch.push(field);
          currentBatchSize += fieldSize;
        }
      });

      // Push any remaining fields after the loop
      if (fieldBatch.length > 0) {
        newEmbeds.push({ ...currentEmbed, fields: fieldBatch });
      }
    } else {
      // Embed is small enough, keep it as is
      newEmbeds.push(currentEmbed);
    }
  }

  return newEmbeds;
}

function calculateEmbedSize(embed) {
  let size = 0;
  size += getStringSize(embed.title || "");
  size += getStringSize(embed.description || "");
  embed.fields.forEach((field) => {
    size += getStringSize(field.name);
    size += getStringSize(field.value);
  });
  size += getStringSize(embed.footer?.text || "");
  return size;
}

function calculateFieldSize(field) {
  return getStringSize(field.name) + getStringSize(field.value);
}

function getStringSize(str) {
  return Buffer.byteLength(str, "utf8");
}

module.exports = { validateLogs, formatLogEmbeds };
