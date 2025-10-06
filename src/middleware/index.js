// src/middleware/index.js
export const clerkIdInjectorWithLogging = (req, res, next) => {
  // sementara kosong, nanti bisa diisi logging Clerk ID
  next();
};

export const performanceLogger = (req, res, next) => {
  // sementara kosong, nanti bisa diisi performance logging
  next();
};
