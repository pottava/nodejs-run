import Router from "express";
const router = Router();
router.disable("x-powered-by");

import { BigQuery } from "@google-cloud/bigquery";
const bigquery = new BigQuery();

export async function insert(record) {
  const datasetId = process.env.BQ_DATASET_ID || "default";
  const tableId = process.env.BQ_TABLE_ID || "metrics";
  await bigquery.dataset(datasetId).table(tableId).insert(record);
}
export function timestamp(date) {
  return bigquery.timestamp(date);
}

router.post("/:id", (req, res) => {
  const record = {
    ts: bigquery.timestamp(new Date()),
    key: `${req.params.id}-${req.body.key}`,
    metric: req.body.value,
  };
  insert(record)
    .then(() => res.status(200).end())
    .catch((err) => res.status(500).send(err.message));
});

export default router;
