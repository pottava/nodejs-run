import Router from "express";
const router = Router();
router.disable("x-powered-by");

router.get("/", async (req, res) => {
  const projectId = process.env.PROJECT_ID || "unknown";
  const latestTag = process.env.CURRENT_VERSION || "latest";

  res.json({
    client_001: `asia-northeast1-docker.pkg.dev/${projectId}/apps/client-001:${latestTag}`,
    client_002: `asia-northeast1-docker.pkg.dev/${projectId}/apps/client-002:${latestTag}`,
  });
});

export default router;
