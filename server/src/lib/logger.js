export default function (req, res, next) {
  const start = new Date().toISOString();
  const ip =
    req.headers["x-forwarded-for"] ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown";

  res.on("finish", () => {
    console.log({
      ip: ip.split(",")[0].trim(),
      method: req.method,
      host: req.hostname,
      url: req.originalUrl || req.url,
      date: start,
      code: res.statusCode,
    });
  });
  next();
}
