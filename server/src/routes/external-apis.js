import Router from "express";
const router = Router();
router.disable("x-powered-by");

import secret from "../lib/secret-manager.js";
import pino from "pino";
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

router.post("/:id", async (req, res) => {
  let apikey;
  try {
    apikey = await secret(`apikey-${req.params.id}`);
  } catch (e) {
    logger.error(e);
    res.status(500).send(e.message);
    return;
  }
  res.send(`Key: ${apikey}`);
});

export default router;
