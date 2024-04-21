import Router from "express";
const router = Router();

router.post("/metrics", (req, res) => {
  res.send("001 saved!");
});

export default router;
