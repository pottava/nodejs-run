import express from "express";
const app = express();
app.disable("x-powered-by");

// For health checks
app.get("/health", (_, res) => {
  res.status(200).end();
});

// クライアント バージョン管理用 API
import routeVersions from "./versions.js";
app.use("/api/v1/versions", routeVersions);

// Access logs
import log from "./lib/logger.js";
app.use(log);

// JSON parser
app.use(express.json());

// Static files
import path from "path";
import { fileURLToPath } from "url";
app.use(express.static(path.dirname(fileURLToPath(import.meta.url)) + "/public"));

// API の実装
import routeMetrics from "./routes/metrics.js";
app.use("/api/v1/metrics", routeMetrics);

import routeBigQuery from "./routes/big-query.js";
app.use("/api/v1/big-query", routeBigQuery);

import routeExternalAPIs from "./routes/external-apis.js";
app.use("/api/v1/external-apis", routeExternalAPIs);

// Server configurations
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.info(`Server listening on ${port}`);
});
