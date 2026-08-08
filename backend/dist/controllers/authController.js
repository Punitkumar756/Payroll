"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = void 0;
const callProcedure_1 = require("../db/callProcedure");
const password_1 = require("../auth/password");
const password_2 = require("../auth/password");
const jwt_1 = require("../auth/jwt");
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'VALIDATION_ERROR', detail: 'username and password required' });
        }
        const user = await (0, callProcedure_1.callSPOne)('sp_auth_login', [username]);
        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', detail: 'Invalid credentials' });
        }
        if (!user.is_active) {
            return res.status(403).json({ error: 'FORBIDDEN', detail: 'Account is deactivated' });
        }
        const valid = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'UNAUTHORIZED', detail: 'Invalid credentials' });
        }
        const payload = {
            userId: user.user_id,
            employeeId: user.employee_id,
            role: user.role_name,
        };
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user.user_id });
        const refreshHash = await (0, password_2.hashPassword)(refreshToken);
        await (0, callProcedure_1.callSP)('sp_auth_update_last_login', [user.user_id, refreshHash]);
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
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token)
            return res.status(400).json({ error: 'VALIDATION_ERROR', detail: 'refreshToken required' });
        const decoded = (0, jwt_1.verifyRefreshToken)(token);
        const user = await (0, callProcedure_1.callSPOne)('sp_auth_refresh_token', [decoded.userId]);
        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'UNAUTHORIZED', detail: 'Invalid refresh token' });
        }
        const payload = {
            userId: user.user_id,
            employeeId: user.employee_id,
            role: user.role_name,
        };
        const newAccessToken = (0, jwt_1.signAccessToken)(payload);
        return res.json({ accessToken: newAccessToken });
    }
    catch {
        return res.status(401).json({ error: 'UNAUTHORIZED', detail: 'Refresh token invalid or expired' });
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=authController.js.map