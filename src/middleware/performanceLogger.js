// src/middleware/performanceLogger.js

export const performanceLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${status}] ${req.method} ${req.originalUrl} - ${duration}ms`);
  });

  next();
};

