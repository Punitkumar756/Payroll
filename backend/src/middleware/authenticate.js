
import { verifyAccessToken } from "../auth/jwt.js";

// Extend Express Request to carry the authenticated user

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({
        error: "UNAUTHORIZED",
        message: "Missing or invalid Authorization header",
      });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res
      .status(401)
      .json({ error: "UNAUTHORIZED", message: "Token invalid or expired" });
  }
}
