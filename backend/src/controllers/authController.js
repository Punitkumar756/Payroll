import { callSP, callSPOne } from "../db/callProcedure.js";
import { comparePassword } from "../auth/password.js";
import { hashPassword } from "../auth/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        detail: "username (or official email) and password (or mobile number) required",
      });
    }

    // SP matches by users.username  OR  employees.official_email
    const user = await callSPOne("sp_auth_login", [username]);

    if (!user) {
      return res.status(401).json({ error: "UNAUTHORIZED", detail: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "FORBIDDEN", detail: "Account is deactivated" });
    }

    // Auth path 1 — bcrypt password (web / admin)
    const validBcrypt = await comparePassword(password, user.password_hash);

    // Auth path 2 — mobile number as password (mobile app)
    // contact_number is now returned by sp_auth_login
    const validMobile = !!(user.contact_number && password === user.contact_number);

    if (!validBcrypt && !validMobile) {
      return res.status(401).json({ error: "UNAUTHORIZED", detail: "Invalid credentials" });
    }

    const payload = {
      userId: user.user_id,
      employeeId: user.employee_id,
      role: user.role_name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ userId: user.user_id });
    const refreshHash = await hashPassword(refreshToken);

    await callSP("sp_auth_update_last_login", [user.user_id, refreshHash]);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        userId: user.user_id,
        employeeId: user.employee_id,
        role: user.role_name,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.official_email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", detail: "refreshToken required" });

    const decoded = verifyRefreshToken(token);
    const user = await callSPOne("sp_auth_refresh_token", [decoded.userId]);

    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ error: "UNAUTHORIZED", detail: "Invalid refresh token" });
    }

    const payload = {
      userId: user.user_id,
      employeeId: user.employee_id,
      role: user.role_name,
    };

    const newAccessToken = signAccessToken(payload);
    return res.json({ accessToken: newAccessToken });
  } catch {
    return res
      .status(401)
      .json({
        error: "UNAUTHORIZED",
        detail: "Refresh token invalid or expired",
      });
  }
};
