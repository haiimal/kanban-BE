export const clerkIdInjectorWithLogging = (req, res, next) => {
  try {
    
    const clerkAuth = typeof req.auth === "function" ? req.auth() : req.auth;
    const clerkUserIdFromAuth = clerkAuth?.userId;

    // fallback ke body atau header
    const clerkUserIdFromBody = req.body?.clerk_user_id;
    const clerkUserIdFromHeader = req.headers["x-clerk-user-id"];

    req.clerkId =
      clerkUserIdFromAuth ||
      clerkUserIdFromBody ||
      clerkUserIdFromHeader ||
      null;

    console.log(
      `Clerk ID injected: ${req.clerkId || "not provided"} | ${req.method} ${req.originalUrl}`
    );

    next();
  } catch (error) {
    console.error("Error in clerkIdInjectorWithLogging:", error);
    next(error);
  }
};
