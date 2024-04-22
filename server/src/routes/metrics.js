import Router from "express";
const router = Router();
router.disable("x-powered-by");

import secret from "../lib/secret-manager.js";
import { insert, timestamp } from "./big-query.js";

router.post("/:id", async (req, res) => {
  let apikey;
  try {
    apikey = await secret(`apikey-${req.params.id}`);
  } catch (e) {
    logger.error(e);
    res.status(500).send(e.message);
    return;
  }
  const record = {
    ts: timestamp(new Date()),
    key: `${req.params.id}-${req.body.key}`,
    metric: req.body.value,
  };
  insert(record)
    .then(() => res.send(`Key: ${apikey}`))
    .catch((err) => res.status(500).send(err.message));
});

export default router;
