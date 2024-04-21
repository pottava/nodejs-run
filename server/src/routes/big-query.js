import Router from "express";
const router = Router();

router.post("/:id", (req, res) => {
  res.send(`ID: ${req.params.id}`);
});

export default router;
