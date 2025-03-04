const config = require("../config.json");

const { NEWRELIC_QUERY_KEY, NEWRELIC_NERDGRAPH_QUERY } = config;

if (!NEWRELIC_QUERY_KEY) {
  throw new Error("Missing NEWRELIC_QUERY_KEY in config.json.");
}

if (!NEWRELIC_NERDGRAPH_QUERY) {
  throw new Error("Missing NEWRELIC_NERDGRAPH_QUERY in config.json.");
}

async function fetchNewRelicLogs() {
  try {
    const response = await fetch(`https://api.eu.newrelic.com/graphql`, {
      method: "POST",
      headers: {
        "API-Key": NEWRELIC_QUERY_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: NEWRELIC_NERDGRAPH_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const responseData = await response.json();
    const logs = responseData.data.actor.account.nrql.results;

    return logs;
  } catch (error) {
    console.error("Error fetching New Relic logs:", error);
    return [];
  }
}

module.exports = fetchNewRelicLogs;
