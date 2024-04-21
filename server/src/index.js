import express from "express";
const app = express();
app.disable("x-powered-by");

// For health checks
app.get("/health", (_, res) => {
  res.status(200).end();
});

// Access logs
import log from "./lib/logger.js";
app.use(log);

// Static files
import path from "path";
import { fileURLToPath } from "url";
app.use(express.static(path.dirname(fileURLToPath(import.meta.url)) + "/public"));

// API の実装
import routeBigQuery from "./routes/big-query.js";
app.use("/api/v1/big-query", routeBigQuery);

import routeSharePoint from "./routes/share-point.js";
app.use("/api/v1/share-point", routeSharePoint);

// Server configurations
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.info(`Server listening on ${port}`);
});
