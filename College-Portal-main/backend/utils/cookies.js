const buildAuthCookieOptions = (req) => {
  const forwardedProto = String(req?.headers?.["x-forwarded-proto"] || "").toLowerCase();
  const isHttps = req?.secure === true || forwardedProto === "https";

  // Cross-site cookies (Vercel -> Render) require SameSite=None + Secure.
  // Only enable this when we are on HTTPS to avoid browsers rejecting the cookie.
  const sameSite = isHttps ? "none" : "lax";
  const secure = isHttps;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

module.exports = {
  buildAuthCookieOptions,
};
