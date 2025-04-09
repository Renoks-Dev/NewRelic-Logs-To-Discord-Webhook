async function sendWebhookBatch(embeds, webhookUrl) {
  const batchSize = 10; // Discord accepts a maximum of 10 embeds per request
  const totalBatches = Math.ceil(embeds.length / batchSize);

  for (let i = 0; i < embeds.length; i += batchSize) {
    const batch = embeds.slice(i, i + batchSize);

    console.log(
      `Sending batch ${Math.floor(i / batchSize) + 1}/${totalBatches} with ${
        batch.length
      } embeds.`
    );

    const success = await sendBatchWithRetry(batch, webhookUrl);
    if (!success) {
      console.error(
        `Failed to send Batch ${
          Math.floor(i / batchSize) + 1
        } logs to Discord: ${
          response && response.statusText
            ? response.statusText
            : "Unknown error"
        } after ${maxRetries} retries.`
      );
    } else {
      console.log(
        `Batch ${
          Math.floor(i / batchSize) + 1
        } of logs sent to Discord Webhook successfully.`
      );
    }
  }
}

async function sendBatchWithRetry(batch, webhookUrl) {
  const maxRetries = 5;
  const retryDelay = 1000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: batch }),
      });

      if (!response.ok) {
        console.log(response);
        console.error(
          `Failed to send logs to the Discord Webhook. Status: ${response.statusText}`
        );
        attempt++;

        const delay = retryDelay * attempt;
        console.log(`Retrying in ${delay / 1000} seconds...`);

        await delayFunction(delay);
      } else {
        return true;
      }
    } catch (error) {
      console.error(`Error sending logs: ${error.message}`);
      attempt++;

      const delay = retryDelay * attempt;

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await delayFunction(delay);
    }
  }

  return false;
}

function delayFunction(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sendWebhookBatch };
