import Router from "express";
const router = Router();

router.post("/metrics", (req, res) => {
  res.send("003 saved!");
});

export default router;
