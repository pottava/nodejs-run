import Router from "express";
const router = Router();

router.post("/:id", (req, res) => {
  const date = new Date().toISOString().replace(/[^0-9]/g, "");
  const name = `${req.params.id.replace(/[^a-zA-Z0-9]/g, "")}-${date}`;

  res.send(`Name: ${name}`);
});

export default router;
