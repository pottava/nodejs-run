import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient();

async function secret(name, version = "latest") {
  const projectId = process.env.PROJECT_ID || "unknown";
  const key = `projects/${projectId}/secrets/${name}/versions/${version}`;
  console.log({ lib: "secret-manager.js", secretKey: key });

  try {
    const res = await client.accessSecretVersion({ name: key });
    const secret = res?.payload?.data?.toString();
    return secret ?? "";
  } catch (err) {
    console.error({ lib: "secret-manager.js", error: err.details });
    return "";
  }
}

export default secret;
