export default function (req, res, next) {
  const date = new Date().toISOString();
  const ip =
    req.headers["x-forwarded-for"] ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown";

  res.on("finish", () => {
    console.info({
      ip: ip.split(",")[0].trim(),
      method: req.method,
      host: req.hostname,
      url: req.originalUrl || req.url,
      date: date,
      code: res.statusCode,
    });
  });
  next();
}
