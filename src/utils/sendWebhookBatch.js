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

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: batch }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send Batch ${
          Math.floor(i / batchSize) + 1
        } logs to Discord: ${response.statusText}`
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

module.exports = { sendWebhookBatch };
