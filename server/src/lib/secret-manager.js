import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient();
import pino from "pino";
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

async function secret(name, version = "latest") {
  const projectId = process.env.PROJECT_ID || "unknown";
  const key = `projects/${projectId}/secrets/${name}/versions/${version}`;
  logger.debug({ lib: "secret-manager.js", secretKey: key });

  const [res] = await client.accessSecretVersion({ name: key });
  return res.payload.data.toString("utf8");
}

export default secret;
