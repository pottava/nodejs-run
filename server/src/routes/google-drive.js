import Router from "express";
const router = Router();

router.post("/metrics", (req, res) => {
  res.send("002 saved!");
});

export default router;
