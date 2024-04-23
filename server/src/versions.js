import Router from "express";
const router = Router();
router.disable("x-powered-by");

router.get("/", async (req, res) => {
  const projectId = process.env.PROJECT_ID || "unknown";

  res.json({
    client_001: `asia-northeast1-docker.pkg.dev/${projectId}/apps/client-001:71b4528`,
    client_002: `asia-northeast1-docker.pkg.dev/${projectId}/apps/client-002:71b4528`,
  });
});

export default router;
